import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

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
          loginEmail: dto.loginEmail,
        },
        include: {
          person: true,
          organization: true,
        },
      });


    if (!user) {
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
      },
    };
  }

}
