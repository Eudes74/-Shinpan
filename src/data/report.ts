import { errors, points, fightTotal, fightScore, roleLabels, aggregateCounts, isComplete, type Category, type Fight } from './errors';

export type ReportForm = {
  candidate: string;
  candidateEmail?: string;
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
  failed: 'AVALIAÇÃO CONCLUÍDA — REPROVADO',
};
export const minimumScore = 60;
export const approvalLabels = { approved: 'Aprovado', failed: 'Reprovado', pending: 'Em Avaliação' } as const;
export const formatScore = (score: number) => score.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
export function getResult(fights: Fight[]) {
  const counts = aggregateCounts(fights);
  const recorded = errors.filter(item => counts[item.id] > 0).map(item => ({ item, quantity: counts[item.id] }));
  const severityCount = (severity: string) => recorded.filter(row => row.item.severity === severity).reduce((sum, row) => sum + row.quantity, 0);
  const light = severityCount('leve');
  const medium = severityCount('medio');
  const grave = severityCount('grave');
  const gravissimo = severityCount('gravissimo');
  // Occurrence totals are informative; each deduction applies only to its own fight.
  const deduction = recorded.reduce((sum, row) => sum + row.quantity * points[row.item.severity], 0);
  const completedFights = fights.filter(fight => fight.role !== '' && fight.verified);
  const validated = completedFights.length;
  const scoreSum = completedFights.reduce((sum, fight) => sum + fightScore(fight), 0);
  const score = validated ? scoreSum / validated : 0;
  const complete = isComplete(fights);
  // Compare the unrounded mean, never a formatted display value.
  const approval: keyof typeof approvalLabels = !complete ? 'pending' : score >= minimumScore ? 'approved' : 'failed';
  const status: Status = !complete ? 'incomplete' : approval === 'failed' ? 'failed' : 'completed';
  return { score, scoreSum, approval, deduction, total: light + medium + grave + gravissimo, light, medium, grave, gravissimo, complete, validated, status, recorded };
}
export type Result = ReturnType<typeof getResult>;

export function shareSummary(form: ReportForm, result: Result, notes: string, fights: Fight[]): string {
  const mean = result.validated ? `${formatScore(result.score)}%` : 'Aguardando a primeira luta concluída';
  const lines = [
    '*SHINPAN | Ficha de Avaliação Prática de Arbitragem*',
    `Candidato: ${form.candidate}`,
    `Federação / Associação: ${form.federation || 'Não informada'}`,
    `Categoria: ${form.current} → ${form.target}`,
    `Avaliador: ${form.evaluator || 'Não informado'}`,
    `Evento: ${form.event || 'Não informado'} | Tatame ${form.tatami}`,
    `*${statusLabels[result.status]}*`,
    `${result.complete ? 'Média Geral Obtida' : 'Média Parcial'}: ${mean}`,
    `Nota Mínima Exigida: ${minimumScore}%`,
    `${result.complete ? 'Resultado Final' : 'Status'}: ${approvalLabels[result.approval]}`,
    `Lutas concluídas: ${result.validated} / ${fightTotal}`,
    `Leves: ${result.light} | Médias: ${result.medium} | Graves: ${result.grave} | Gravíssimas: ${result.gravissimo}`,
    'Registro por luta:',
    ...fights.map(fight => {
      const entries = errors.filter(item => fight.counts[item.id]).map(item => `${item.label} ×${fight.counts[item.id]}`).join('; ');
      const completed = fight.role !== '' && fight.verified;
      return `Luta ${String(fight.number).padStart(2, '0')} | ${fight.role ? roleLabels[fight.role] : 'Sem função'} | ${entries || 'Sem faltas registradas'} | Nota da Luta: ${fightScore(fight)} / 100 | ${completed ? 'Concluída' : 'Pendente (fora da média)'}`;
    }),
    `Critérios: cada luta começa com 100 pontos, com nota mínima de 0. Leve: -2; média: -5; grave: -10; gravíssima: -20 pontos na própria luta. A média considera apenas lutas concluídas (função definida e visto). Após as ${fightTotal} lutas, média de ${minimumScore}% ou mais: APROVADO; abaixo: REPROVADO.`,
  ];
  if (notes.trim()) lines.push(`Observações: ${notes.trim()}`);
  return lines.join('\n');
}
