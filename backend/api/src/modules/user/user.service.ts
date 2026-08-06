import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';


@Injectable()
export class UserService {

  constructor(
    private readonly prisma: PrismaService,
  ) {}


  async create(dto: CreateUserDto) {

    const person = await this.prisma.person.findUnique({
      where: {
        id: dto.personId,
      },
    });


    if (!person) {
      throw new NotFoundException(
        'Pessoa não encontrada',
      );
    }


    const existingUser =
      await this.prisma.user.findUnique({
        where: {
          personId: dto.personId,
        },
      });


    if (existingUser) {
      throw new ConflictException(
        'Esta pessoa já possui usuário',
      );
    }


    const passwordHash =
      await bcrypt.hash(dto.password, 10);


    return this.prisma.user.create({
      data: {
        personId: dto.personId,
        passwordHash,
      },
    });
  }
}
