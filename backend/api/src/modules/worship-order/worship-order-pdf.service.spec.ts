import { WorshipOrderPdfService } from './worship-order-pdf.service';

describe('WorshipOrderPdfService', () => {
  it('gera um PDF válido com a ordem e as escalas do culto', async () => {
    const service = new WorshipOrderPdfService();

    const pdf = await service.render({
      status: 'PUBLISHED',
      event: {
        titulo: 'Culto de Domingo',
        inicio: new Date('2026-08-09T22:30:00.000Z'),
        fim: new Date('2026-08-10T00:30:00.000Z'),
        campus: { nome: 'Campus Central' },
        schedules: [{
          data: new Date('2026-08-09T22:30:00.000Z'),
          funcao: 'Vocal',
          status: 'CONFIRMED',
          person: { nome: 'Ana Souza' },
          team: { nome: 'Louvor', serviceArea: { nome: 'Música' } },
        }],
      },
      items: [{
        sequencia: 1,
        titulo: 'Louvor',
        horario: '19:30',
        observacoes: 'Iniciar com oração.',
        responsiblePerson: { nome: 'Ana Souza' },
        serviceArea: { nome: 'Música' },
        materials: [{ type: 'MUSIC', titulo: 'Repertório', referencia: null }],
        demands: [{
          descricao: 'Enviar repertório final.',
          dueAt: new Date('2026-08-09T17:00:00.000Z'),
          status: 'PENDING',
          responsiblePerson: { nome: 'Ana Souza' },
          serviceArea: { nome: 'Música' },
        }],
      }],
    });

    expect(pdf.subarray(0, 4).toString()).toBe('%PDF');
    expect(pdf.toString('latin1')).toContain('%%EOF');
  });
});
