import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { EventType, NotificationAudience, UserRole } from '../src/generated/prisma/client';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { configureApplication } from '../src/app.factory';

type Fixture = {
  campusAId: string;
  campusBId: string;
  personBId: string;
  kidsAreaId: string;
  kidsTeamBId: string;
};

describe('permissões HTTP multi-campus', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApplication(app);
    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Organization" CASCADE');
  });

  afterAll(async () => {
    await app.close();
  });

  it('autentica o usuário e exige JWT em uma rota protegida', async () => {
    await createFixture(prisma);

    await request(app.getHttpServer()).get('/events').expect(401);

    const response = await login(app, 'pastor.a@integration.test');

    expect(response.body.access_token).toEqual(expect.any(String));
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${response.body.access_token}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.organizationId).toEqual(expect.any(String));
        expect(body.personId).toEqual(expect.any(String));
      });
  });

  it('reporta disponibilidade real do banco no health check de prontidão', async () => {
    await request(app.getHttpServer())
      .get('/health/ready')
      .expect(200)
      .expect(({ body }) => expect(body.database).toBe('ok'));
  });

  it('bloqueia no HTTP as operações do pastor em outro campus e libera o pastor sênior', async () => {
    const fixture = await createFixture(prisma);
    const pastorToken = (await login(app, 'pastor.a@integration.test')).body.access_token;
    const seniorToken = (await login(app, 'senior@integration.test')).body.access_token;

    const event = {
      titulo: 'Reunião pastoral no campus B',
      type: EventType.PASTORAL,
      campusId: fixture.campusBId,
      inicio: '2031-01-15T18:00:00.000Z',
      fim: '2031-01-15T20:00:00.000Z',
    };
    const kidsClass = {
      nome: 'Kids 7 a 9 anos',
      campusId: fixture.campusBId,
      serviceAreaId: fixture.kidsAreaId,
      teamId: fixture.kidsTeamBId,
      capacidade: 20,
    };
    const notification = {
      titulo: 'Aviso pastoral',
      mensagem: 'Mensagem destinada a uma pessoa do campus B.',
      audience: NotificationAudience.PERSON,
      personId: fixture.personBId,
      campusId: fixture.campusAId,
    };

    await request(app.getHttpServer()).post('/events').set('Authorization', `Bearer ${pastorToken}`).send(event).expect(403);
    await request(app.getHttpServer()).post('/kids/classes').set('Authorization', `Bearer ${pastorToken}`).send(kidsClass).expect(403);
    await request(app.getHttpServer()).post('/notifications').set('Authorization', `Bearer ${pastorToken}`).send(notification).expect(403);

    await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${seniorToken}`)
      .send(event)
      .expect(201)
      .expect(({ body }) => expect(body.campusId).toBe(fixture.campusBId));
    await request(app.getHttpServer())
      .post('/kids/classes')
      .set('Authorization', `Bearer ${seniorToken}`)
      .send(kidsClass)
      .expect(201)
      .expect(({ body }) => expect(body.campusId).toBe(fixture.campusBId));
    await request(app.getHttpServer())
      .post('/notifications')
      .set('Authorization', `Bearer ${seniorToken}`)
      .send(notification)
      .expect(201)
      .expect(({ body }) => expect(body.recipients).toHaveLength(1));

    const auditLogs = await prisma.auditLog.findMany({
      where: { resource: { in: ['/events', '/kids/classes', '/notifications'] } },
      orderBy: { createdAt: 'asc' },
    });
    expect(auditLogs).toHaveLength(3);
    expect(auditLogs.every(log => log.actorUserId)).toBe(true);
  });

  it('aplica a validação dos DTOs na rota de negócio', async () => {
    await createFixture(prisma);
    const token = (await login(app, 'pastor.a@integration.test')).body.access_token;

    await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: 'x', campusId: 'invalido', campoForjado: true })
      .expect(400);
  });

  it('pagina listagens centrais e usa o formato padronizado de erro', async () => {
    await createFixture(prisma);
    const token = (await login(app, 'pastor.a@integration.test')).body.access_token;

    await request(app.getHttpServer())
      .get('/persons?page=1&limit=1')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toHaveLength(1);
        expect(body.meta).toEqual(expect.objectContaining({ page: 1, limit: 1, total: 3, totalPages: 3 }));
      });

    await request(app.getHttpServer())
      .get('/persons?page=0')
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
      .expect(({ body }) => {
        expect(body).toEqual(expect.objectContaining({ statusCode: 400, path: '/persons?page=0' }));
      });
  });
});

async function login(app: INestApplication, loginEmail: string) {
  return request(app.getHttpServer())
    .post('/auth/login')
    .send({ loginEmail, password: 'SenhaDeIntegracao@123' })
    .expect(201);
}

async function createFixture(prisma: PrismaService): Promise<Fixture> {
  const organization = await prisma.organization.create({
    data: { nome: 'Organização HTTP de Integração', dominio: 'http-integration.ibag.test' },
  });
  const campusA = await prisma.campus.create({
    data: { nome: 'Campus A', cidade: 'Cidade A', estado: 'SP', organizationId: organization.id },
  });
  const campusB = await prisma.campus.create({
    data: { nome: 'Campus B', cidade: 'Cidade B', estado: 'SP', organizationId: organization.id },
  });
  const [pastor, senior, personB] = await Promise.all([
    prisma.person.create({ data: { nome: 'Pastor do Campus A', email: 'pastor.a@integration.test', campusId: campusA.id, organizationId: organization.id } }),
    prisma.person.create({ data: { nome: 'Pastor Sênior', email: 'senior@integration.test', campusId: campusA.id, organizationId: organization.id } }),
    prisma.person.create({ data: { nome: 'Pessoa do Campus B', email: 'pessoa.b@integration.test', campusId: campusB.id, organizationId: organization.id } }),
  ]);
  const passwordHash = await bcrypt.hash('SenhaDeIntegracao@123', 4);
  await Promise.all([
    prisma.user.create({ data: { loginEmail: 'pastor.a@integration.test', passwordHash, personId: pastor.id, organizationId: organization.id, role: UserRole.PASTOR } }),
    prisma.user.create({ data: { loginEmail: 'senior@integration.test', passwordHash, personId: senior.id, organizationId: organization.id, role: UserRole.PASTOR_SENIOR } }),
  ]);
  const kidsArea = await prisma.serviceArea.create({
    data: { nome: 'IBAG Kids', scope: 'GLOBAL', organizationId: organization.id },
  });
  const kidsTeamB = await prisma.serviceTeam.create({
    data: { nome: 'Faixa 7 a 9', organizationId: organization.id, serviceAreaId: kidsArea.id, campusId: campusB.id },
  });

  return {
    campusAId: campusA.id,
    campusBId: campusB.id,
    personBId: personB.id,
    kidsAreaId: kidsArea.id,
    kidsTeamBId: kidsTeamB.id,
  };
}
