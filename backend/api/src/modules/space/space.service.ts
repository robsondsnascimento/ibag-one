import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationContext } from '../../common/context/organization-context';
import { PrismaService } from '../../database/prisma.service';
import { CreateSpaceDto } from './dto/create-space.dto';

@Injectable()
export class SpaceService {
  constructor(private readonly prisma: PrismaService) {}
  async create(dto: CreateSpaceDto, context: OrganizationContext) {
    await this.authorize(context);
    const campus = await this.prisma.campus.findFirst({ where: { id: dto.campusId, organizationId: context.organizationId, ativo: true } });
    if (!campus) throw new NotFoundException('Campus ativo não encontrado na organização atual');
    return this.prisma.space.create({ data: { ...dto, organizationId: context.organizationId }, include: { campus: true } });
  }
  async findAll(campusId: string | undefined, context: OrganizationContext) {
    return this.prisma.space.findMany({ where: { organizationId: context.organizationId, ativo: true, ...(campusId ? { campusId } : {}) }, include: { campus: true }, orderBy: { nome: 'asc' } });
  }
  private async authorize(context: OrganizationContext) {
    const user = await this.prisma.user.findFirst({ where: { id: context.userId, organizationId: context.organizationId } });
    if (!user || !['SECRETARY', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) throw new ForbiddenException('Somente secretaria ou administração pode gerenciar espaços');
  }
}
