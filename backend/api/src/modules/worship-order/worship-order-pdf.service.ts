import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

type WorshipOrderPdfData = {
  status: string;
  event: {
    titulo: string;
    inicio: Date;
    fim: Date;
    campus: { nome: string };
    schedules: Array<{
      data: Date;
      funcao: string;
      status: string;
      person: { nome: string };
      team: { nome: string; serviceArea: { nome: string } };
    }>;
  };
  items: Array<{
    sequencia: number;
    titulo: string;
    horario: string | null;
    observacoes: string | null;
    responsiblePerson: { nome: string } | null;
    serviceArea: { nome: string } | null;
    materials: Array<{ type: string; titulo: string; referencia: string | null }>;
    demands: Array<{
      descricao: string;
      dueAt: Date | null;
      status: string;
      responsiblePerson: { nome: string } | null;
      serviceArea: { nome: string };
    }>;
  }>;
};

@Injectable()
export class WorshipOrderPdfService {
  render(order: WorshipOrderPdfData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const document = new PDFDocument({
        size: 'A4',
        margin: 42,
        bufferPages: true,
        info: {
          Title: `Ordem de Culto - ${order.event.titulo}`,
          Author: 'IBAG One',
          Subject: 'Ordem de culto',
        },
      });
      const chunks: Buffer[] = [];
      document.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
      document.on('error', reject);
      document.on('end', () => resolve(Buffer.concat(chunks)));

      this.header(document, order);
      this.eventDetails(document, order);
      this.section(document, 'Sequência do culto');

      for (const item of order.items) {
        this.ensureSpace(document, 105);
        const time = item.horario ? ` - ${item.horario}` : '';
        document.fillColor('#0F172A').font('Helvetica-Bold').fontSize(12).text(`${item.sequencia}. ${item.titulo}${time}`);
        document.font('Helvetica').fontSize(9).fillColor('#475569');
        const ownership = [item.serviceArea ? `Área: ${item.serviceArea.nome}` : null, item.responsiblePerson ? `Responsável: ${item.responsiblePerson.nome}` : null].filter(Boolean).join(' | ');
        if (ownership) document.text(ownership);
        if (item.observacoes) document.fillColor('#334155').text(`Observações: ${item.observacoes}`);

        if (item.materials.length) {
          document.fillColor('#0F766E').font('Helvetica-Bold').text('Materiais');
          document.font('Helvetica').fillColor('#334155');
          item.materials.forEach(material => document.text(`• ${material.titulo}${material.referencia ? ` (${material.referencia})` : ''}`));
        }
        if (item.demands.length) {
          document.fillColor('#B45309').font('Helvetica-Bold').text('Pendências');
          document.font('Helvetica').fillColor('#334155');
          item.demands.forEach(demand => {
            const details = [
              this.demandStatus(demand.status),
              demand.serviceArea.nome,
              demand.responsiblePerson?.nome,
              demand.dueAt ? `Prazo: ${this.date(demand.dueAt)}` : null,
            ].filter(Boolean).join(' | ');
            document.text(`• ${demand.descricao} (${details})`);
          });
        }
        document.moveDown(0.65);
      }

      this.section(document, 'Escalas do culto');
      if (!order.event.schedules.length) {
        document.font('Helvetica').fontSize(10).fillColor('#475569').text('Nenhuma pessoa escalada para este culto.');
      } else {
        order.event.schedules.forEach(schedule => {
          this.ensureSpace(document, 36);
          document.font('Helvetica-Bold').fontSize(10).fillColor('#0F172A').text(`${schedule.person.nome} - ${schedule.funcao}`);
          document.font('Helvetica').fontSize(9).fillColor('#475569').text(`${schedule.team.serviceArea.nome} / ${schedule.team.nome} | ${this.date(schedule.data)} | ${this.scheduleStatus(schedule.status)}`);
          document.moveDown(0.35);
        });
      }

      this.footers(document);
      document.end();
    });
  }

  private header(document: PDFKit.PDFDocument, order: WorshipOrderPdfData) {
    document.fillColor('#0F766E').font('Helvetica-Bold').fontSize(19).text('IBAG One');
    document.fillColor('#0F172A').fontSize(16).text('Ordem de Culto');
    document.moveDown(0.35).strokeColor('#CBD5E1').lineWidth(1).moveTo(42, document.y).lineTo(553, document.y).stroke().moveDown(0.7);
  }

  private eventDetails(document: PDFKit.PDFDocument, order: WorshipOrderPdfData) {
    document.fillColor('#0F172A').font('Helvetica-Bold').fontSize(13).text(order.event.titulo);
    document.font('Helvetica').fontSize(10).fillColor('#475569').text(`${order.event.campus.nome} | ${this.date(order.event.inicio)} até ${this.time(order.event.fim)}`);
    document.text(`Status da ordem: ${order.status === 'PUBLISHED' ? 'Publicada' : 'Rascunho'}`);
  }

  private section(document: PDFKit.PDFDocument, title: string) {
    this.ensureSpace(document, 46);
    document.moveDown(0.8).fillColor('#0F766E').font('Helvetica-Bold').fontSize(13).text(title);
    document.moveDown(0.35);
  }

  private ensureSpace(document: PDFKit.PDFDocument, required: number) {
    if (document.y + required > document.page.height - document.page.margins.bottom) {
      document.addPage();
      document.fillColor('#0F766E').font('Helvetica-Bold').fontSize(10).text('IBAG One - Ordem de Culto');
      document.moveDown(0.35).strokeColor('#CBD5E1').lineWidth(1).moveTo(42, document.y).lineTo(553, document.y).stroke().moveDown(0.6);
    }
  }

  private footers(document: PDFKit.PDFDocument) {
    const range = document.bufferedPageRange();
    for (let page = range.start; page < range.start + range.count; page += 1) {
      document.switchToPage(page);
      document.font('Helvetica').fontSize(8).fillColor('#64748B').text(
        `IBAG One | Ordem de Culto | Página ${page - range.start + 1} de ${range.count}`,
        42,
        document.page.height - document.page.margins.bottom - 14,
        { align: 'center', width: document.page.width - 84 },
      );
    }
  }

  private date(value: Date) {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(value);
  }

  private time(value: Date) {
    return new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(value);
  }

  private demandStatus(status: string) {
    return ({ PENDING: 'Pendente', COMPLETED: 'Concluída', CANCELLED: 'Cancelada' } as Record<string, string>)[status] ?? status;
  }

  private scheduleStatus(status: string) {
    return ({ SCHEDULED: 'Escalado', CONFIRMED: 'Confirmado', DECLINED: 'Recusado', COMPLETED: 'Concluído' } as Record<string, string>)[status] ?? status;
  }
}
