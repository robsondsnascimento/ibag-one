import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {

  constructor(
    private prisma: PrismaService,
  ) {}

  async create(dto: CreateUserDto) {

    const person = await this.prisma.person.findUnique({
      where: {
        id: dto.personId,
      },
    });

    if (!person) {
      throw new Error('Pessoa não encontrada');
    }

    const loginEmail = this.generateLogin(person.nome);

    const passwordHash = await bcrypt.hash(
      dto.password,
      10,
    );

    return this.prisma.user.create({
      data: {
        loginEmail,
        passwordHash,
        personId: person.id,
      },
    });
  }


  private generateLogin(nome: string) {

    const normalized = nome
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

    const parts = normalized.split(' ');

    return `${parts[0]}.${parts[parts.length - 1]}@ibag.one`;
  }

}
