import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { configureApplication } from '../src/app.factory';

describe('Health (e2e)', () => {
  let app: INestApplication<App>;
  const prisma = { user: { findUnique: jest.fn() } };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleFixture.createNestApplication();
    configureApplication(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health retorna a identidade e o estado da API', async () => {
    await request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({
        status: 'ok',
        service: 'IBAG One API',
        codename: 'Project Nehemiah',
        version: '0.1.0',
      });
  });

  it('publica o contrato OpenAPI', async () => {
    await request(app.getHttpServer())
      .get('/docs-json')
      .expect(200)
      .expect(({ body }) => {
        expect(body.info.title).toBe('IBAG One API');
        expect(body.paths['/events']).toBeDefined();
      });
  });

  it('rejeita acesso sem JWT a uma rota de negócio', async () => {
    await request(app.getHttpServer())
      .get('/service-areas')
      .expect(401);
  });

  it('rejeita uma tentativa de login com conta inexistente', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ loginEmail: 'inexistente@ibag.one', password: 'senha-invalida' })
      .expect(401)
      .expect(({ body }) => {
        expect(body.message).toBe('Usuário ou senha inválidos');
      });
  });

  it('rejeita campos não previstos nos contratos da API', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ loginEmail: 'pessoa@ibag.one', password: 'senha', privilegioForjado: true })
      .expect(400);
  });
});
