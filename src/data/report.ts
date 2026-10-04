import { errors, groups, points, type Category, type ErrorItem } from './errors';

export type ReportForm = {
  candidate: string;
  federation: string;
  current: Category;
  target: Category;
  evaluator: string;
  event: string;
  tatami: string;
};
export type Status = 'approved' | 'retest' | 'failed';
export const statusLabels: Record<Status, string> = {
  approved: 'APROVADO',
  retest: 'EM OBSERVAÇÃO / RETESTE',
  failed: 'REPROVADO',
};
export type Result = {
  score: number;
  total: number;
  medium: number;
  grave: number;
  safety: number;
  veto: boolean;
  minimum: number;
  maxMedium: number;
  noGrave: boolean;
  status: Status;
  reasons: string[];
  recorded: { item: ErrorItem; quantity: number }[];
  strongGroups: typeof groups;
};

export function getResult(form: ReportForm, counts: Record<string, number>): Result {
  const quantity = (item: ErrorItem) => counts[item.id] ?? 0;
  const recorded = errors.filter(item => quantity(item) > 0).map(item => ({ item, quantity: quantity(item) }));
  const total = recorded.reduce((sum, row) => sum + row.quantity, 0);
  const score = Math.max(0, 100 - recorded.reduce((sum, row) => sum + row.quantity * points[row.item.severity], 0));
  const medium = recorded.filter(row => row.item.severity === 'medio').reduce((sum, row) => sum + row.quantity, 0);
  const grave = recorded.filter(row => row.item.severity === 'grave').reduce((sum, row) => sum + row.quantity, 0);
  const safety = recorded.filter(row => row.item.safety).reduce((sum, row) => sum + row.quantity, 0);
  const graveRules = recorded.filter(row => row.item.group === 'regras' && row.item.severity === 'grave').reduce((sum, row) => sum + row.quantity, 0);
  const minimum = form.target === 'Regional' ? 70 : form.target === 'Estadual' ? 80 : 90;
  const maxMedium = form.target === 'Regional' ? 4 : form.target === 'Estadual' ? 3 : 1;
  const noGrave = form.target !== 'Regional' && form.target !== 'Estadual';
  const veto = safety > 0 || graveRules >= 2;
  const reasons: string[] = [];
  if (safety > 0) reasons.push(`${safety} ocorrência(s) grave(s) de segurança — veto automático.`);
  if (graveRules >= 2) reasons.push(`${graveRules} ocorrências graves de regra — veto automático.`);
  if (noGrave && grave > 0 && !veto) reasons.push('Categorias Nacional/FIJ não permitem erros graves.');
  if (score < minimum) reasons.push(`Pontuação abaixo do mínimo de ${minimum} pontos (${score}/100).`);
  if (medium > maxMedium) reasons.push(`${medium} ocorrências médias; limite da categoria: ${maxMedium}.`);
  const status: Status = veto || (noGrave && grave > 0) || score < minimum - 5 || medium > maxMedium + 1
    ? 'failed'
    : score < minimum || medium > maxMedium ? 'retest' : 'approved';
  if (!reasons.length) reasons.push(`Pontuação e ocorrências dentro da régua da categoria ${form.target}, sem veto.`);
  return {
    score, total, medium, grave, safety, veto, minimum, maxMedium, noGrave, status, reasons, recorded,
    strongGroups: groups.filter(group => !recorded.some(row => row.item.group === group.id)),
  };
}

export function shareSummary(form: ReportForm, result: Result, notes: string): string {
  const lines = [
    '*SHINPAN | Avaliação de Arbitragem de Judô*',
    `Candidato: ${form.candidate}`,
    `Federação / Associação: ${form.federation || 'Não informada'}`,
    `Categoria: ${form.current} → ${form.target}`,
    `Avaliador: ${form.evaluator || 'Não informado'}`,
    `Evento: ${form.event || 'Não informado'} | Tatame ${form.tatami}`,
    `*Resultado: ${statusLabels[result.status]}*`,
    `Pontuação: ${result.score}/100 (mín. ${result.minimum})`,
    `Ocorrências: ${result.total} | Médias: ${result.medium}/${result.maxMedium} | Graves: ${result.grave}`,
    `Veto: ${result.veto ? 'Sim' : 'Não'}`,
    `Critérios: ${result.reasons.join(' ')}`,
    `Pontos fortes: ${result.strongGroups.length ? result.strongGroups.map(group => group.label).join(', ') : 'Nenhuma área sem ocorrências'}`,
    'Oportunidades de melhoria:',
    ...(result.recorded.length ? result.recorded.map(({ item, quantity }) => `• ${item.label} (${quantity}×; −${quantity * points[item.severity]} pts)`) : ['Nenhuma ocorrência registrada.']),
  ];
  if (notes.trim()) lines.push(`Observações: ${notes.trim()}`);
  return lines.join('\n');
}
