import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

const defaultLoginDomain = 'ibag.one';

@Injectable()
export class AuthService {

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {

    const user =
      await this.prisma.user.findUnique({
        where: {
          loginEmail: this.normalizeLogin(dto.loginEmail),
        },
        include: {
          person: {
            select: {
              id: true,
              nome: true,
              ativo: true,
              campusId: true,
              campus: {
                select: {
                  nome: true,
                },
              },
              campusMemberships: {
                where: { ativo: true },
                select: {
                  campusId: true,
                  campus: { select: { id: true, nome: true } },
                },
              },
            },
          },
          organization: {
            select: {
              id: true,
              nome: true,
              ativo: true,
            },
          },
          additionalRoles: {
            select: {
              role: true,
            },
          },
        },
      });


    if (
      !user ||
      !user.ativo ||
      !user.person.ativo ||
      !user.organizationId ||
      !user.organization ||
      !user.organization.ativo
    ) {
      throw new UnauthorizedException(
        'Usuário ou senha inválidos',
      );
    }


    const passwordValid =
      await bcrypt.compare(
        dto.password,
        user.passwordHash,
      );


    if (!passwordValid) {
      throw new UnauthorizedException(
        'Usuário ou senha inválidos',
      );
    }


    const payload = {
      sub: user.id,
      personId: user.personId,
      organizationId: user.organizationId,
    };


    return {
      access_token:
        await this.jwtService.signAsync(payload),

      user: {
        id: user.id,
        loginEmail: user.loginEmail,
        personId: user.personId,
        organizationId: user.organizationId,
        role: user.role,
        additionalRoles: user.additionalRoles.map(item => item.role),
        person: {
          id: user.person.id,
          nome: user.person.nome,
          campusId: user.person.campusId,
          campus: user.person.campus,
          campusMemberships: user.person.campusMemberships,
        },
        organization: {
          id: user.organization.id,
          nome: user.organization.nome,
        },
      },
    };
  }

  private normalizeLogin(login: string) {
    const value = login.trim().toLowerCase();
    return value.includes('@') ? value : `${value}@${defaultLoginDomain}`;
  }

}
