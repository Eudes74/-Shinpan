import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { errors, fightDeduction, fightTotal, points, roleLabels, severityLabels, type Fight } from '../data/errors';
import { formatEventDate } from '../data/events';
import { approvalLabels, getResult, type ReportForm } from '../data/report';

export type EvaluationPdf = { blob: Blob; filename: string; pages: number };
const margin = 14;
const top = 33;
const bottom = 17;
const value = (text?: string) => text?.trim() || 'Não informado';
const safeName = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70) || 'arbitro';

function finishDocument(doc: jsPDF, form: ReportForm): EvaluationPdf {
  const pages = doc.getNumberOfPages();
  const generatedAt = new Date().toLocaleString('pt-BR');
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    doc.setTextColor(20, 30, 45);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(19);
    doc.text('SHINPAN', margin, 15);
    doc.setFontSize(9);
    doc.text('FICHA INDIVIDUAL DE AVALIAÇÃO DE ARBITRAGEM', margin, 23);
    doc.setDrawColor(80, 90, 105);
    doc.setLineWidth(0.3);
    doc.line(margin, 27, 196, 27);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(65, 70, 80);
    doc.line(margin, 282, 196, 282);
    doc.text(`SHINPAN | Gerado em ${generatedAt}`, margin, 288);
    doc.text(`Página ${page} de ${pages}`, 196, 288, { align: 'right' });
  }
  const date = form.date || form.eventStartDate || '';
  return { blob: doc.output('blob'), filename: `SHINPAN-Ficha-${safeName(form.candidate)}${/^\d{4}-\d{2}-\d{2}$/.test(date) ? `-${date}` : ''}.pdf`, pages };
}

export function generateEvaluationPdf(form: ReportForm, fights: Fight[], notes: string): EvaluationPdf {
  const result = getResult(fights);
  if (!result.complete) throw new Error('Conclua e valide os 20 combates antes de gerar a ficha final.');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  doc.setProperties({ title: `Ficha de Avaliação de Arbitragem - ${form.candidate}`, subject: form.event || 'Avaliação de arbitragem', author: form.evaluator || 'SHINPAN', creator: 'SHINPAN' });
  let y = top;
  const tableEnd = () => {
    y = ((doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 5;
  };
  const section = (title: string, rows: string[][]) => {
    autoTable(doc, {
      startY: y,
      margin: { top, bottom, left: margin, right: margin },
      theme: 'grid',
      head: [[{ content: title, colSpan: rows[0]?.length || 1 }]],
      body: rows,
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 2.5, textColor: [20, 30, 45], lineColor: [190, 195, 200], lineWidth: 0.15, overflow: 'linebreak', valign: 'top' },
      headStyles: { fillColor: [232, 236, 241], textColor: [20, 30, 45], fontStyle: 'bold' },
      rowPageBreak: 'avoid',
    });
    tableEnd();
  };
  section('DADOS DO EVENTO / COMPETIÇÃO', [
    [`Evento / Competição: ${value(form.event)}`],
    [`Local / Cidade / Ginásio: ${value(form.eventLocation)}`],
    [`Data da avaliação: ${formatEventDate(form.date || form.eventStartDate) || 'Não informada'} | Tatame / Área: ${value(form.tatami)}`],
    [`Período do evento: ${formatEventDate(form.eventStartDate) || 'Não informado'} a ${formatEventDate(form.eventEndDate) || 'Não informado'}`],
    [`Entidade organizadora: ${value(form.eventOrganizer)}`],
  ]);
  section('IDENTIFICAÇÃO DO ÁRBITRO E DO AVALIADOR', [
    [`Árbitro avaliado: ${value(form.candidate)}`],
    [`Categoria atual: ${value(form.current)} | Categoria / Exame pleiteado: ${value(form.target)}`],
    [`Federação / Associação: ${value(form.federation)}`],
    [`Avaliador / Responsável: ${value(form.evaluator)}`],
    [`Função do avaliador no evento: ${value(form.evaluatorRole)}`],
  ]);
  section('RESUMO DO RESULTADO', [
    ['Pontuação inicial: 100', `Deduções: -${result.deduction} pts`, `Nota final: ${result.score} / 100`],
    [`Status: ${result.complete ? approvalLabels[result.approval] : 'Em Avaliação'}`, `Combates validados: ${result.validated} / ${fightTotal}`, `Infrações: ${result.total}`],
    [`Leves: ${result.light} | Médias: ${result.medium}`, `Graves: ${result.grave}`, `Gravíssimas: ${result.gravissimo}`],
  ]);
  section('CRITÉRIOS DE APURAÇÃO', [
    ['Aprovado FIJ: 85 pontos ou mais. Aprovado CBJ: 80 a 84 pontos. Reprovado: abaixo de 80 pontos. Duas ou mais faltas gravíssimas implicam reprovação automática, independentemente da nota.'],
    [result.veto ? `REPROVAÇÃO AUTOMÁTICA: ${result.gravissimo} faltas gravíssimas registradas.` : 'Sem veto por faltas gravíssimas. Resultado final apurado sobre os 20 combates validados.'],
  ]);
  doc.addPage();
  y = top;
  autoTable(doc, {
    startY: y,
    margin: { top, bottom, left: margin, right: margin },
    theme: 'grid',
    head: [['Luta Nº', 'Função exercida', 'Infrações registradas e deduções', 'Total', 'Observações / Visto']],
    body: fights.map(fight => {
      const entries = errors.filter(item => (fight.counts[item.id] ?? 0) > 0).map(item => {
        const quantity = fight.counts[item.id];
        return `${item.id} - ${item.label}\n${severityLabels[item.severity]} | ${quantity} x ${points[item.severity]} pts = -${quantity * points[item.severity]} pts`;
      });
      return [
        String(fight.number).padStart(2, '0'),
        fight.role ? roleLabels[fight.role] : 'Não informada',
        entries.join('\n\n') || 'Nenhuma infração registrada.',
        `-${fightDeduction(fight)} pts`,
        `${fight.notes?.trim() || 'Sem observações.'}\n\nVisto: ${fight.verified ? 'Concluído' : 'Pendente'}`,
      ];
    }),
    styles: { font: 'helvetica', fontSize: 8, cellPadding: 2, textColor: [20, 30, 45], lineColor: [190, 195, 200], lineWidth: 0.15, overflow: 'linebreak', valign: 'top' },
    headStyles: { fillColor: [232, 236, 241], textColor: [20, 30, 45], fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 13 }, 1: { cellWidth: 22 }, 2: { cellWidth: 91 }, 3: { cellWidth: 17 }, 4: { cellWidth: 39 } },
    rowPageBreak: 'avoid',
    showHead: 'everyPage',
  });
  tableEnd();
  // One paragraph per row lets long notes flow across pages without being clipped.
  section('OBSERVAÇÕES GERAIS', (notes.trim() || 'Nenhuma observação geral registrada.').replace(/\r\n?/g, '\n').split('\n').map(line => [line || ' ']));
  // Keep both signature lines together, above the fixed page footer.
  if (y + 46 > doc.internal.pageSize.getHeight() - bottom) { doc.addPage(); y = top; }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(20, 30, 45);
  doc.text('ASSINATURAS', margin, y + 5);
  doc.setDrawColor(80, 90, 105);
  doc.setLineWidth(0.25);
  doc.line(margin, y + 28, 99, y + 28);
  doc.line(111, y + 28, 196, y + 28);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Assinatura do Avaliador / Responsável', 56.5, y + 34, { align: 'center' });
  doc.text('Assinatura do Árbitro Avaliado', 153.5, y + 34, { align: 'center' });
  doc.setFontSize(8);
  doc.text('Local e data: _____________________________________________________', margin, y + 44);
  return finishDocument(doc, form);
}
