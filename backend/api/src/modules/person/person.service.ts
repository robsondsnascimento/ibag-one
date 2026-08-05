import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

@Injectable()
export class PersonService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPersonDto: CreatePersonDto) {
    return await this.prisma.person.create({
      data: {
        ...createPersonDto,
      },
    });
  }

  async findAll() {
    return await this.prisma.person.findMany({
      include: {
        campus: true,
      },
    });
  }

  async findOne(id: string) {
    return await this.prisma.person.findUnique({
      where: { id },
      include: {
        campus: true,
      },
    });
  }

  async update(id: string, updatePersonDto: UpdatePersonDto) {
    return await this.prisma.person.update({
      where: { id },
      data: updatePersonDto,
    });
  }

  async remove(id: string) {
    return await this.prisma.person.update({
      where: { id },
      data: {
        ativo: false,
      },
    });
  }
}
