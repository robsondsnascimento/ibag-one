import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationContext } from '../../common/context/organization-context';
import { PrismaService } from '../../database/prisma.service';
import { AuthorizeKidsPickupDto } from './dto/authorize-kids-pickup.dto';
import { CreateKidsClassDto } from './dto/create-kids-class.dto';
import { EnrollKidDto } from './dto/enroll-kid.dto';
import { KidsCheckInDto } from './dto/kids-check-in.dto';
import { CreateKidsChildDto } from './dto/create-kids-child.dto';
import { AssignKidsOperationalRoleDto } from './dto/assign-kids-operational-role.dto';
import { ScanKidsQrDto } from './dto/scan-kids-qr.dto';
import { UpsertKidsCareProfileDto } from './dto/upsert-kids-care-profile.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class KidsService {
  constructor(private readonly prisma: PrismaService) {}

  async createClass(dto: CreateKidsClassDto, c: OrganizationContext) {
    await this.authorize(c, dto.serviceAreaId);
    if (dto.idadeMinima != null && dto.idadeMaxima != null && dto.idadeMinima > dto.idadeMaxima) throw new BadRequestException('A idade mínima não pode ser maior que a máxima');
    const campus = await this.prisma.campus.findFirst({ where: { id: dto.campusId, organizationId: c.organizationId, ativo: true } });
    const area = await this.prisma.serviceArea.findFirst({ where: { id: dto.serviceAreaId, organizationId: c.organizationId, ativo: true, OR: [{ scope: 'GLOBAL' }, { campusId: dto.campusId }] } });
    if (!campus || !area) throw new BadRequestException('Campus ou área Kids inválidos para esta turma');
    if (!await this.prisma.serviceTeam.findFirst({ where: { id: dto.teamId, organizationId: c.organizationId, serviceAreaId: dto.serviceAreaId, campusId: dto.campusId, ativo: true } })) throw new BadRequestException('A equipe deve pertencer à Área Kids e ao mesmo campus da turma');
    if (dto.spaceId && !await this.prisma.space.findFirst({ where: { id: dto.spaceId, campusId: dto.campusId, organizationId: c.organizationId, ativo: true } })) throw new BadRequestException('A sala deve pertencer ao campus da turma');
    return this.prisma.kidsClass.create({ data: { ...dto, organizationId: c.organizationId }, include: { campus: true, space: true, serviceArea: true } });
  }

  async createChild(dto: CreateKidsChildDto, c: OrganizationContext) {
    await this.assertSensitiveAccess(c);
    if (!await this.prisma.campus.findFirst({ where: { id: dto.campusId, organizationId: c.organizationId, ativo: true } })) throw new NotFoundException('Campus ativo não encontrado');
    const { alergias, restricoesAlimentares, necessidadesFisicas, necessidadesCognitivas, dataNascimento, ...person } = dto;
    return this.prisma.person.create({ data: { ...person, dataNascimento: new Date(dataNascimento), organizationId: c.organizationId, kidsIdentity: { create: { qrCode: randomUUID() } }, kidsCareProfile: { create: { alergias, restricoesAlimentares, necessidadesFisicas, necessidadesCognitivas } } }, include: { kidsIdentity: true, kidsCareProfile: true } });
  }
  async careProfile(childId: string, c: OrganizationContext) { await this.assertSensitiveAccess(c); await this.person(childId, c); return this.prisma.kidsCareProfile.findUnique({ where: { childId } }); }
  async upsertCareProfile(childId: string, dto: UpsertKidsCareProfileDto, c: OrganizationContext) { await this.assertSensitiveAccess(c); await this.person(childId, c); return this.prisma.kidsCareProfile.upsert({ where: { childId }, create: { childId, ...dto }, update: dto }); }

  async assignOperationalRole(dto: AssignKidsOperationalRoleDto, c: OrganizationContext) {
    await this.assertSensitiveAccess(c); await this.person(dto.personId, c);
    if (!await this.prisma.campus.findFirst({ where: { id: dto.campusId, organizationId: c.organizationId, ativo: true } })) throw new NotFoundException('Campus ativo não encontrado');
    if (await this.prisma.kidsOperationalRoleAssignment.findFirst({ where: { ...dto, ativo: true } })) throw new BadRequestException('A pessoa já possui esta função Kids ativa neste campus');
    return this.prisma.kidsOperationalRoleAssignment.create({ data: { ...dto, organizationId: c.organizationId } });
  }

  async classes(c: OrganizationContext) {
    const areaIds = await this.accessibleAreaIds(c);
    const classes = await this.prisma.kidsClass.findMany({ where: { organizationId: c.organizationId, ativo: true, ...(areaIds ? { serviceAreaId: { in: areaIds } } : {}) }, include: { campus: true, space: true, serviceArea: true, _count: { select: { enrollments: { where: { ativo: true } } } } }, orderBy: { nome: 'asc' } });
    return Promise.all(classes.map(async klass => ({ ...klass, currentOccupancy: await this.prisma.kidsCheckIn.count({ where: { status: 'CHECKED_IN', enrollment: { classId: klass.id } } }) })));
  }

  async enroll(classId: string, dto: EnrollKidDto, c: OrganizationContext) {
    const klass = await this.klass(classId, c); await this.authorize(c, klass.serviceAreaId); await this.person(dto.childId, c);
    if (await this.prisma.kidsEnrollment.findFirst({ where: { childId: dto.childId, ativo: true } })) throw new BadRequestException('A criança já possui matrícula ativa');
    return this.prisma.kidsEnrollment.create({ data: { classId, childId: dto.childId }, include: { child: true, class: true } });
  }

  async authorizePickup(childId: string, dto: AuthorizeKidsPickupDto, c: OrganizationContext) {
    const enrollment = await this.enrollment(childId, c); await this.authorize(c, enrollment.class.serviceAreaId); await this.person(dto.responsiblePersonId, c);
    return this.prisma.kidsAuthorizedPickup.upsert({ where: { childId_responsiblePersonId: { childId, responsiblePersonId: dto.responsiblePersonId } }, create: { childId, ...dto }, update: { parentesco: dto.parentesco, ativo: true } });
  }

  async checkIn(dto: KidsCheckInDto, c: OrganizationContext) {
    const enrollment = await this.enrollment(dto.childId, c); await this.authorizeOperation(c, enrollment.class.campusId, 'CHECK_IN'); await this.assertPickup(dto.childId, dto.responsiblePersonId, c);
    if (await this.prisma.kidsCheckIn.findFirst({ where: { childId: dto.childId, status: 'CHECKED_IN' } })) throw new BadRequestException('A criança já possui um check-in aberto');
    const pickupCode = randomUUID();
    const checkIn = await this.prisma.kidsCheckIn.create({ data: { childId: dto.childId, enrollmentId: enrollment.id, checkedInByPersonId: dto.responsiblePersonId, pickupCode }, include: { child: { include: { kidsIdentity: true } }, enrollment: { include: { class: true } } } });
    await this.notify(c, dto.responsiblePersonId, 'Check-in IBAG Kids', `${checkIn.child.nome} realizou check-in na turma ${checkIn.enrollment.class.nome}.`);
    return checkIn;
  }
  async scanCheckIn(dto: ScanKidsQrDto, c: OrganizationContext) { const identity = await this.prisma.kidsIdentity.findUnique({ where: { qrCode: dto.childQrCode } }); if (!identity) throw new NotFoundException('QR da criança não encontrado'); return this.checkIn({ childId: identity.childId, responsiblePersonId: dto.responsiblePersonId }, c); }

  async checkOut(id: string, dto: KidsCheckInDto, c: OrganizationContext) {
    const item = await this.prisma.kidsCheckIn.findFirst({ where: { id, status: 'CHECKED_IN', enrollment: { class: { organizationId: c.organizationId } } }, include: { enrollment: { include: { class: true } } } });
    if (!item) throw new NotFoundException('Check-in aberto não encontrado'); if (!dto.pickupCode || dto.pickupCode !== item.pickupCode) throw new ForbiddenException('A etiqueta de retirada não corresponde a este check-in'); await this.authorizeOperation(c, item.enrollment.class.campusId, 'CHECK_IN'); await this.assertPickup(item.childId, dto.responsiblePersonId, c);
    const checkOut = await this.prisma.kidsCheckIn.update({ where: { id }, data: { status: 'CHECKED_OUT', checkOutAt: new Date(), checkedOutByPersonId: dto.responsiblePersonId }, include: { child: true, enrollment: { include: { class: true } } } });
    await this.notify(c, dto.responsiblePersonId, 'Check-out IBAG Kids', `${checkOut.child.nome} realizou check-out da turma ${checkOut.enrollment.class.nome}.`);
    return checkOut;
  }
  async scanCheckOut(dto: ScanKidsQrDto, c: OrganizationContext) { const identity = await this.prisma.kidsIdentity.findUnique({ where: { qrCode: dto.childQrCode } }); if (!identity) throw new NotFoundException('QR da criança não encontrado'); const checkIn = await this.prisma.kidsCheckIn.findFirst({ where: { childId: identity.childId, status: 'CHECKED_IN' } }); if (!checkIn) throw new NotFoundException('Check-in aberto não encontrado'); return this.checkOut(checkIn.id, { childId: identity.childId, responsiblePersonId: dto.responsiblePersonId, pickupCode: dto.pickupCode }, c); }

  async openCheckIns(c: OrganizationContext) {
    const areaIds = await this.accessibleAreaIds(c);
    return this.prisma.kidsCheckIn.findMany({ where: { status: 'CHECKED_IN', enrollment: { class: { organizationId: c.organizationId, ...(areaIds ? { serviceAreaId: { in: areaIds } } : {}) } } }, include: { child: true, enrollment: { include: { class: { include: { campus: true, space: true } } } } }, orderBy: { checkInAt: 'asc' } });
  }
  async worshipOverview(eventId: string, c: OrganizationContext) {
    const event = await this.prisma.event.findFirst({ where: { id: eventId, organizationId: c.organizationId, campusId: { not: undefined }, type: 'WORSHIP', status: 'APPROVED' } });
    if (!event) throw new NotFoundException('Culto aprovado não encontrado');
    const role = await this.prisma.kidsOperationalRoleAssignment.findFirst({ where: { personId: c.personId, campusId: event.campusId, role: 'WORSHIP_LEADER', ativo: true } });
    const scheduled = await this.prisma.serviceSchedule.findFirst({ where: { personId: c.personId, eventId } });
    if (!role || !scheduled) throw new ForbiddenException('A visão Kids exige função de Líder de Culto e escala neste culto');
    const classes = await this.prisma.kidsClass.findMany({ where: { organizationId: c.organizationId, campusId: event.campusId, ativo: true }, select: { id: true, nome: true, capacidade: true, _count: { select: { enrollments: { where: { ativo: true } } } } } });
    return Promise.all(classes.map(async klass => ({ ...klass, currentOccupancy: await this.prisma.kidsCheckIn.count({ where: { status: 'CHECKED_IN', enrollment: { classId: klass.id } } }) })));
  }

  private async enrollment(childId: string, c: OrganizationContext) { const value = await this.prisma.kidsEnrollment.findFirst({ where: { childId, ativo: true, class: { organizationId: c.organizationId } }, include: { class: true } }); if (!value) throw new BadRequestException('A criança não possui matrícula Kids ativa'); return value; }
  private async klass(id: string, c: OrganizationContext) { const value = await this.prisma.kidsClass.findFirst({ where: { id, organizationId: c.organizationId, ativo: true } }); if (!value) throw new NotFoundException('Turma Kids ativa não encontrada'); return value; }
  private async person(id: string, c: OrganizationContext) { const value = await this.prisma.person.findFirst({ where: { id, organizationId: c.organizationId, ativo: true } }); if (!value) throw new NotFoundException('Pessoa ativa não encontrada'); return value; }
  private async assertPickup(childId: string, personId: string, c: OrganizationContext) { if (!await this.prisma.kidsAuthorizedPickup.findFirst({ where: { childId, responsiblePersonId: personId, ativo: true, child: { organizationId: c.organizationId } } })) throw new ForbiddenException('Esta pessoa não está autorizada a retirar a criança'); }
  private async notify(c: OrganizationContext, personId: string, titulo: string, mensagem: string) { await this.prisma.notification.create({ data: { titulo, mensagem, audience: 'PERSON', organizationId: c.organizationId, recipients: { create: { personId } } } }); }
  private async accessibleAreaIds(c: OrganizationContext): Promise<string[] | undefined> { const user = await this.prisma.user.findFirst({ where: { id: c.userId, organizationId: c.organizationId } }); if (user && ['SECRETARY','ADMIN','SUPER_ADMIN','PASTOR'].includes(user.role)) return undefined; const links = await this.prisma.serviceMembership.findMany({ where: { personId: c.personId, ativo: true, role: { in: ['GENERAL_LEADER','CAMPUS_LEADER','TEAM_LEADER'] } }, select: { serviceAreaId: true } }); if (!links.length) throw new ForbiddenException('Sem acesso à operação IBAG Kids'); return links.map(link => link.serviceAreaId); }
  private async authorize(c: OrganizationContext, serviceAreaId: string) { const ids = await this.accessibleAreaIds(c); if (ids && !ids.includes(serviceAreaId)) throw new ForbiddenException('Sem acesso a esta área Kids'); }
  private async authorizeOperation(c: OrganizationContext, campusId: string, role: 'CHECK_IN') { const user = await this.prisma.user.findFirst({ where: { id: c.userId, organizationId: c.organizationId } }); if (user && ['SECRETARY','ADMIN','SUPER_ADMIN','PASTOR'].includes(user.role)) return; if (await this.prisma.kidsOperationalRoleAssignment.findFirst({ where: { personId: c.personId, campusId, role, ativo: true } })) return; if (await this.prisma.serviceMembership.findFirst({ where: { personId: c.personId, ativo: true, role: { in: ['GENERAL_LEADER','CAMPUS_LEADER'] }, serviceArea: { kidsClasses: { some: { campusId, ativo: true } } } } })) return; throw new ForbiddenException('Sem função operacional Kids para esta ação'); }
  private async assertSensitiveAccess(c: OrganizationContext) { const user = await this.prisma.user.findFirst({ where: { id: c.userId, organizationId: c.organizationId } }); if (user && ['SECRETARY','ADMIN','SUPER_ADMIN','PASTOR'].includes(user.role)) return; const leadership = await this.prisma.serviceMembership.findFirst({ where: { personId: c.personId, ativo: true, role: { in: ['GENERAL_LEADER','CAMPUS_LEADER'] }, serviceArea: { kidsClasses: { some: { organizationId: c.organizationId, ativo: true } } } } }); if (!leadership) throw new ForbiddenException('Sem acesso operacional completo à IBAG Kids'); }
}
