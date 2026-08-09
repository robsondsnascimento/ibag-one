import { ForbiddenException } from '@nestjs/common';
import { EventType, NotificationAudience, UserRole } from '../src/generated/prisma/client';
import { OrganizationContext } from '../src/common/context/organization-context';
import { PrismaService } from '../src/database/prisma.service';
import { CellCampusCoordinationService } from '../src/modules/cell-campus-coordination/cell-campus-coordination.service';
import { CellNetworkSupervisionService } from '../src/modules/cell-network-supervision/cell-network-supervision.service';
import { EventService } from '../src/modules/event/event.service';
import { KidsService } from '../src/modules/kids/kids.service';
import { NotificationService } from '../src/modules/notification/notification.service';

type Fixture = {
  organizationId: string;
  campusAId: string;
  campusBId: string;
  pastorContext: OrganizationContext;
  seniorContext: OrganizationContext;
  coordinatorContext: OrganizationContext;
  coordinatorPersonId: string;
  supervisorPersonId: string;
  personBId: string;
  networkAId: string;
  networkBId: string;
  kidsAreaId: string;
  kidsTeamBId: string;
};

describe('escopo multi-campus (integração PostgreSQL)', () => {
  let prisma: PrismaService;
  let coordinations: CellCampusCoordinationService;
  let supervisions: CellNetworkSupervisionService;
  let events: EventService;
  let kids: KidsService;
  let notifications: NotificationService;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.onModuleInit();
    coordinations = new CellCampusCoordinationService(prisma);
    supervisions = new CellNetworkSupervisionService(prisma);
    events = new EventService(prisma);
    kids = new KidsService(prisma);
    notifications = new NotificationService(prisma);
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Organization" CASCADE');
  });

  afterAll(async () => {
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Organization" CASCADE');
    await prisma.$disconnect();
  });

  it('limita o pastor ao seu campus e permite ao pastor sênior coordenar outro campus', async () => {
    const fixture = await createFixture(prisma);

    await expect(
      coordinations.create(
        { personId: fixture.coordinatorPersonId, campusId: fixture.campusBId },
        fixture.pastorContext,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    const coordination = await coordinations.create(
      { personId: fixture.coordinatorPersonId, campusId: fixture.campusBId },
      fixture.seniorContext,
    );

    expect(coordination.campusId).toBe(fixture.campusBId);
    expect(coordination.ativo).toBe(true);
  });

  it('restringe a supervisão de rede ao campus coordenado', async () => {
    const fixture = await createFixture(prisma);
    await prisma.cellCampusCoordination.create({
      data: {
        personId: fixture.coordinatorPersonId,
        campusId: fixture.campusAId,
      },
    });

    await expect(
      supervisions.create(
        { personId: fixture.supervisorPersonId, networkId: fixture.networkBId },
        fixture.coordinatorContext,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    const supervision = await supervisions.create(
      { personId: fixture.supervisorPersonId, networkId: fixture.networkAId },
      fixture.coordinatorContext,
    );

    expect(supervision.networkId).toBe(fixture.networkAId);
    expect(supervision.ativo).toBe(true);
  });

  it('não permite ao pastor criar evento em outro campus e libera o pastor sênior', async () => {
    const fixture = await createFixture(prisma);
    const dto = {
      titulo: 'Reunião pastoral no campus B',
      type: EventType.PASTORAL,
      campusId: fixture.campusBId,
      inicio: '2031-01-15T18:00:00.000Z',
      fim: '2031-01-15T20:00:00.000Z',
    };

    await expect(events.create(dto, fixture.pastorContext)).rejects.toBeInstanceOf(ForbiddenException);

    const event = await events.create(dto, fixture.seniorContext);

    expect(event.campusId).toBe(fixture.campusBId);
    expect(event.createdByUserId).toBe(fixture.seniorContext.userId);
  });

  it('mantém as turmas Kids no campus do pastor e libera o pastor sênior', async () => {
    const fixture = await createFixture(prisma);
    const dto = {
      nome: 'Kids 7 a 9 anos',
      campusId: fixture.campusBId,
      serviceAreaId: fixture.kidsAreaId,
      teamId: fixture.kidsTeamBId,
      capacidade: 20,
    };

    await expect(kids.createClass(dto, fixture.pastorContext)).rejects.toBeInstanceOf(ForbiddenException);

    const kidsClass = await kids.createClass(dto, fixture.seniorContext);

    expect(kidsClass.campusId).toBe(fixture.campusBId);
    expect(kidsClass.serviceAreaId).toBe(fixture.kidsAreaId);
  });

  it('impede que um alvo individual contorne o escopo do campus do pastor', async () => {
    const fixture = await createFixture(prisma);
    const dto = {
      titulo: 'Aviso pastoral',
      mensagem: 'Mensagem destinada a uma pessoa do campus B.',
      audience: NotificationAudience.PERSON,
      personId: fixture.personBId,
      campusId: fixture.campusAId,
    };

    await expect(notifications.create(dto, fixture.pastorContext)).rejects.toBeInstanceOf(ForbiddenException);

    const notification = await notifications.create(dto, fixture.seniorContext);

    expect(notification.recipients).toHaveLength(1);
    expect(notification.recipients[0].personId).toBe(fixture.personBId);
  });
});

async function createFixture(prisma: PrismaService): Promise<Fixture> {
  const organization = await prisma.organization.create({
    data: { nome: 'Organização de Integração', dominio: 'integration.ibag.test' },
  });
  const campusA = await prisma.campus.create({
    data: { nome: 'Campus A', cidade: 'Cidade A', estado: 'SP', organizationId: organization.id },
  });
  const campusB = await prisma.campus.create({
    data: { nome: 'Campus B', cidade: 'Cidade B', estado: 'SP', organizationId: organization.id },
  });
  const [pastor, senior, coordinator, supervisor, personB] = await Promise.all([
    prisma.person.create({ data: personData('Pastor do Campus A', 'pastor.a@integration.test', campusA.id, organization.id) }),
    prisma.person.create({ data: personData('Pastor Sênior', 'senior@integration.test', campusA.id, organization.id) }),
    prisma.person.create({ data: personData('Coordenador de Células', 'coordenador@integration.test', campusA.id, organization.id) }),
    prisma.person.create({ data: personData('Supervisor de Rede', 'supervisor@integration.test', campusA.id, organization.id) }),
    prisma.person.create({ data: personData('Pessoa do Campus B', 'pessoa.b@integration.test', campusB.id, organization.id) }),
  ]);
  const [pastorUser, seniorUser, coordinatorUser] = await Promise.all([
    prisma.user.create({ data: userData('pastor.a@integration.test', pastor.id, organization.id, UserRole.PASTOR) }),
    prisma.user.create({ data: userData('senior@integration.test', senior.id, organization.id, UserRole.PASTOR_SENIOR) }),
    prisma.user.create({ data: userData('coordenador@integration.test', coordinator.id, organization.id, UserRole.MEMBER) }),
  ]);
  const [networkA, networkB, kidsArea] = await Promise.all([
    prisma.cellNetwork.create({ data: { nome: 'Rede Campus A', organizationId: organization.id, campusId: campusA.id } }),
    prisma.cellNetwork.create({ data: { nome: 'Rede Campus B', organizationId: organization.id, campusId: campusB.id } }),
    prisma.serviceArea.create({ data: { nome: 'IBAG Kids', scope: 'GLOBAL', organizationId: organization.id } }),
  ]);
  const kidsTeamB = await prisma.serviceTeam.create({
    data: {
      nome: 'Faixa 7 a 9',
      organizationId: organization.id,
      serviceAreaId: kidsArea.id,
      campusId: campusB.id,
    },
  });

  return {
    organizationId: organization.id,
    campusAId: campusA.id,
    campusBId: campusB.id,
    pastorContext: context(pastorUser.id, pastor.id, organization.id),
    seniorContext: context(seniorUser.id, senior.id, organization.id),
    coordinatorContext: context(coordinatorUser.id, coordinator.id, organization.id),
    coordinatorPersonId: coordinator.id,
    supervisorPersonId: supervisor.id,
    personBId: personB.id,
    networkAId: networkA.id,
    networkBId: networkB.id,
    kidsAreaId: kidsArea.id,
    kidsTeamBId: kidsTeamB.id,
  };
}

function personData(nome: string, email: string, campusId: string, organizationId: string) {
  return { nome, email, campusId, organizationId };
}

function userData(loginEmail: string, personId: string, organizationId: string, role: UserRole) {
  return { loginEmail, passwordHash: 'integration-test-only', personId, organizationId, role };
}

function context(userId: string, personId: string, organizationId: string): OrganizationContext {
  return { userId, personId, organizationId };
}
