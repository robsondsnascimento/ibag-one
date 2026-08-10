import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
    },
  };
  const jwtService = {
    signAsync: jest.fn(),
  };

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(prisma as never, jwtService as never);
  });

  it('accepts an IBAG username and creates a session with the organization context', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      loginEmail: 'admin@ibag.one',
      passwordHash: 'hash',
      ativo: true,
      personId: 'person-1',
      role: 'SUPER_ADMIN',
      person: {
        id: 'person-1',
        nome: 'Robson Nascimento',
        ativo: true,
        campusId: 'campus-1',
        campus: { nome: 'Campus Centro' },
      },
      organizationId: 'organization-1',
      organization: { id: 'organization-1', nome: 'IBAG', ativo: true },
      additionalRoles: [{ role: 'SECRETARY' }],
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValue('access-token');

    await expect(service.login({ loginEmail: 'admin', password: 'senha' }))
      .resolves.toEqual({
        access_token: 'access-token',
        user: expect.objectContaining({
          id: 'user-1',
          loginEmail: 'admin@ibag.one',
          role: 'SUPER_ADMIN',
          additionalRoles: ['SECRETARY'],
          person: expect.objectContaining({ nome: 'Robson Nascimento' }),
          organization: expect.objectContaining({ nome: 'IBAG' }),
        }),
      });

    expect(prisma.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { loginEmail: 'admin@ibag.one' },
    }));
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'user-1',
      personId: 'person-1',
      organizationId: 'organization-1',
    });
  });

  it('rejects a disabled organization before validating the password', async () => {
    prisma.user.findUnique.mockResolvedValue({
      ativo: true,
      person: { ativo: true },
      organizationId: 'organization-1',
      organization: { ativo: false },
    });

    await expect(service.login({ loginEmail: 'admin@ibag.one', password: 'senha' }))
      .rejects.toBeInstanceOf(UnauthorizedException);

    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('rejects an invalid password without exposing whether the account exists', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      passwordHash: 'hash',
      ativo: true,
      personId: 'person-1',
      person: { ativo: true },
      organizationId: 'organization-1',
      organization: { ativo: true },
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.login({ loginEmail: 'admin@ibag.one', password: 'senha-incorreta' }))
      .rejects.toMatchObject({
        message: 'Usuário ou senha inválidos',
      });
  });
});
