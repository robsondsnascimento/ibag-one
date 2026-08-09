import { BadRequestException, NotFoundException } from '@nestjs/common';
import { KidsService } from './kids.service';

describe('KidsService — QR de retirada', () => {
  const context = { userId: 'user-1', personId: 'operator-1', organizationId: 'org-1' };
  let prisma: any;
  let service: KidsService;

  beforeEach(() => {
    prisma = { kidsIdentity: { findUnique: jest.fn() }, kidsCheckIn: { findFirst: jest.fn(), findMany: jest.fn() }, kidsEnrollment: { findFirst: jest.fn() }, kidsAuthorizedPickup: { findFirst: jest.fn() }, event: { findFirst: jest.fn() }, kidsPreCheckIn: { findFirst: jest.fn(), update: jest.fn(), updateMany: jest.fn() }, user: { findFirst: jest.fn() }, kidsOperationalRoleAssignment: { findFirst: jest.fn() }, serviceMembership: { findFirst: jest.fn() }, kidsClass: { findFirst: jest.fn(), findMany: jest.fn() }, person: { findFirst: jest.fn() }, serviceSchedule: { findFirst: jest.fn() } };
    service = new KidsService(prisma);
  });

  it('recusa leitura de QR infantil inexistente no check-out', async () => {
    prisma.kidsIdentity.findUnique.mockResolvedValue(null);
    await expect(service.scanCheckOut({ childQrCode: 'missing-qr', responsiblePersonId: 'person-1', pickupCode: 'tag-1' }, context)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('encaminha QR válido e etiqueta para o check-out do check-in aberto', async () => {
    prisma.kidsIdentity.findUnique.mockResolvedValue({ childId: 'child-1' });
    prisma.kidsCheckIn.findFirst.mockResolvedValue({ id: 'checkin-1' });
    const checkOut = jest.spyOn(service, 'checkOut').mockResolvedValue({ id: 'checkin-1' } as any);
    await service.scanCheckOut({ childQrCode: 'valid-qr', responsiblePersonId: 'person-1', pickupCode: 'tag-1' }, context);
    expect(checkOut).toHaveBeenCalledWith('checkin-1', { childId: 'child-1', responsiblePersonId: 'person-1', pickupCode: 'tag-1' }, context);
  });

  it('recusa retirada quando a criança não possui check-in aberto', async () => {
    prisma.kidsIdentity.findUnique.mockResolvedValue({ childId: 'child-1' });
    prisma.kidsCheckIn.findFirst.mockResolvedValue(null);
    await expect(service.scanCheckOut({ childQrCode: 'valid-qr', responsiblePersonId: 'person-1', pickupCode: 'tag-1' }, context)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('recusa pré-check-in duplicado para a mesma criança e culto', async () => {
    prisma.kidsEnrollment.findFirst.mockResolvedValue({ id: 'enrollment-1', class: { campusId: 'campus-1' } });
    prisma.kidsAuthorizedPickup.findFirst.mockResolvedValue({ id: 'pickup-1' });
    prisma.event.findFirst.mockResolvedValue({ id: 'event-1' });
    prisma.kidsCheckIn.findFirst.mockResolvedValue(null);
    prisma.kidsPreCheckIn.findFirst.mockResolvedValue({ id: 'pre-1' });
    await expect(service.preCheckIn({ childId: 'child-1', eventId: 'event-1' }, { ...context, personId: 'responsible-1' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('cancela somente o pré-check-in pendente do próprio responsável', async () => {
    prisma.kidsPreCheckIn.findFirst.mockResolvedValue({ id: 'pre-1' });
    prisma.kidsPreCheckIn.update.mockResolvedValue({ id: 'pre-1', status: 'CANCELLED' });
    await service.cancelPreCheckIn('pre-1', { ...context, personId: 'responsible-1' });
    expect(prisma.kidsPreCheckIn.update).toHaveBeenCalledWith({ where: { id: 'pre-1' }, data: { status: 'CANCELLED' } });
  });

  it('recusa cancelamento de pré-check-in inexistente ou de outro responsável', async () => {
    prisma.kidsPreCheckIn.findFirst.mockResolvedValue(null);
    await expect(service.cancelPreCheckIn('pre-1', context)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('expira em lote apenas os pré-check-ins pendentes do culto', async () => {
    prisma.event.findFirst.mockResolvedValue({ id: 'event-1', campusId: 'campus-1' });
    prisma.user.findFirst.mockResolvedValue({ role: 'MEMBER' });
    prisma.kidsOperationalRoleAssignment.findFirst.mockResolvedValue({ id: 'checkin-role-1' });
    prisma.kidsPreCheckIn.updateMany.mockResolvedValue({ count: 2 });
    await service.expirePreCheckIns('event-1', context);
    expect(prisma.kidsPreCheckIn.updateMany).toHaveBeenCalledWith({ where: { eventId: 'event-1', status: 'PENDING' }, data: { status: 'EXPIRED' } });
  });

  it('bloqueia servo sem vínculo com a equipe da faixa', async () => {
    prisma.kidsClass.findFirst.mockResolvedValue({ id: 'class-1', serviceAreaId: 'kids-area', teamId: 'team-a' });
    prisma.user.findFirst.mockResolvedValue({ role: 'MEMBER' });
    prisma.serviceMembership.findFirst.mockResolvedValue(null);
    await expect(service.classAttendance('class-1', context)).rejects.toBeInstanceOf(require('@nestjs/common').ForbiddenException);
  });

  it('bloqueia perfil de cuidado para quem não é liderança Kids nem administração', async () => {
    prisma.user.findFirst.mockResolvedValue({ role: 'MEMBER' });
    prisma.person.findFirst.mockResolvedValue({ id: 'child-1', campusId: 'campus-1' });
    prisma.serviceMembership.findFirst.mockResolvedValue(null);
    await expect(service.childAttendance('child-1', context)).rejects.toBeInstanceOf(require('@nestjs/common').ForbiddenException);
  });

  it('limita a listagem de turmas ao campus do pastor', async () => {
    prisma.user.findFirst.mockResolvedValue({ role: 'PASTOR', person: { campusId: 'campus-1' }, additionalRoles: [] });
    prisma.kidsClass.findMany.mockResolvedValue([]);

    await service.classes(context);

    expect(prisma.kidsClass.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ campusId: 'campus-1' }),
    }));
  });

  it('impede o pastor de operar check-in em outro campus e permite o pastor sênior', async () => {
    prisma.user.findFirst.mockResolvedValue({ role: 'PASTOR', person: { campusId: 'campus-1' }, additionalRoles: [] });
    await expect((service as any).authorizeOperation(context, 'campus-2', 'CHECK_IN')).rejects.toBeInstanceOf(require('@nestjs/common').ForbiddenException);

    prisma.user.findFirst.mockResolvedValue({ role: 'PASTOR_SENIOR', person: { campusId: 'campus-1' }, additionalRoles: [] });
    await expect((service as any).authorizeOperation(context, 'campus-2', 'CHECK_IN')).resolves.toBeUndefined();
  });

  it('bloqueia visão do culto sem função ativa de Líder de Culto', async () => {
    prisma.event.findFirst.mockResolvedValue({ id: 'event-1', campusId: 'campus-1' });
    prisma.kidsOperationalRoleAssignment.findFirst.mockResolvedValue(null);
    prisma.serviceSchedule.findFirst.mockResolvedValue({ id: 'schedule-1' });
    await expect(service.worshipOverview('event-1', context)).rejects.toBeInstanceOf(require('@nestjs/common').ForbiddenException);
  });
});
