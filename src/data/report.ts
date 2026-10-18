import { errors, points, fightTotal, roleLabels, aggregateCounts, isComplete, type Category, type Fight } from './errors';

export type ReportForm = {
  candidate: string;
  federation: string;
  current: Category;
  target: Category;
  evaluator: string;
  evaluatorRole?: string;
  event: string;
  eventId?: string;
  eventLocation?: string;
  eventStartDate?: string;
  eventEndDate?: string;
  eventOrganizer?: string;
  eventAreas?: number;
  date?: string;
  tatami: string;
};
export type Status = 'completed' | 'incomplete' | 'failed';
export const statusLabels: Record<Status, string> = {
  completed: 'AVALIAÇÃO CONCLUÍDA',
  incomplete: 'AVALIAÇÃO INCOMPLETA',
  failed: 'REPROVAÇÃO AUTOMÁTICA',
};
export const approvalLabels = { fij: 'Aprovado FIJ', cbj: 'Aprovado CBJ', failed: 'Reprovado' } as const;
export function getResult(fights: Fight[]) {
  const counts = aggregateCounts(fights);
  const recorded = errors.filter(item => counts[item.id] > 0).map(item => ({ item, quantity: counts[item.id] }));
  const severityCount = (severity: string) => recorded.filter(row => row.item.severity === severity).reduce((sum, row) => sum + row.quantity, 0);
  const light = severityCount('leve');
  const medium = severityCount('medio');
  const grave = severityCount('grave');
  const gravissimo = severityCount('gravissimo');
  const deduction = recorded.reduce((sum, row) => sum + row.quantity * points[row.item.severity], 0);
  const veto = gravissimo >= 2;
  const complete = isComplete(fights);
  const validated = fights.filter(fight => fight.role && fight.verified).length;
  const status: Status = veto ? 'failed' : complete ? 'completed' : 'incomplete';
  const score = 100 - deduction;
  const approval: keyof typeof approvalLabels = veto || score < 80 ? 'failed' : score >= 85 ? 'fij' : 'cbj';
  return { score, approval, deduction, total: light + medium + grave + gravissimo, light, medium, grave, gravissimo, veto, complete, validated, status, recorded };
}
export type Result = ReturnType<typeof getResult>;

export function shareSummary(form: ReportForm, result: Result, notes: string, fights: Fight[]): string {
  const lines = [
    '*SHINPAN | Ficha de Avaliação Prática FIJ / CBJ*',
    `Candidato: ${form.candidate}`,
    `Federação / Associação: ${form.federation || 'Não informada'}`,
    `Categoria: ${form.current} → ${form.target}`,
    `Avaliador: ${form.evaluator || 'Não informado'}`,
    `Evento: ${form.event || 'Não informado'} | Tatame ${form.tatami}`,
    `*${statusLabels[result.status]}*`,
    `Pontuação: ${result.score} (100 − ${result.deduction})`,
    `${result.complete ? 'Resultado final' : 'Status provisório'}: ${approvalLabels[result.approval]}`,
    `Combates validados: ${result.validated}/${fightTotal}`,
    `Leves: ${result.light} | Médias: ${result.medium} | Graves: ${result.grave} | Gravíssimas: ${result.gravissimo}`,
    `Reprovação automática (2+ faltas gravíssimas): ${result.veto ? 'Sim' : 'Não'}`,
    'Registro por combate:',
    ...fights.map(fight => {
      const entries = errors.filter(item => fight.counts[item.id]).map(item => `${item.label} ×${fight.counts[item.id]}`).join('; ');
      return `Luta ${String(fight.number).padStart(2, '0')} | ${fight.role ? roleLabels[fight.role] : 'Sem função'} | ${entries || 'Sem faltas registradas'} | Visto: ${fight.verified ? 'Sim' : 'Pendente'}`;
    }),
    'Critérios: Aprovado FIJ com 85+ pontos; Aprovado CBJ de 80 a 84 pontos; Reprovado abaixo de 80 pontos. Duas ou mais faltas gravíssimas implicam reprovação automática, independentemente da pontuação.',
  ];
  if (notes.trim()) lines.push(`Observações: ${notes.trim()}`);
  return lines.join('\n');
}
