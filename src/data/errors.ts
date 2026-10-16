export const categories = ['Regional', 'Estadual', 'Nacional C', 'Nacional B', 'Nacional A', 'FIJ Continental', 'FIJ Internacional'] as const;
export type Category = typeof categories[number];
export type Severity = 'leve' | 'medio' | 'grave' | 'gravissimo';
export type GroupId = 'regras' | 'gestual' | 'posicionamento' | 'seguranca';
export type ErrorItem = { id: string; label: string; severity: Severity; group: GroupId; safety?: boolean };
export const groups: { id: GroupId; label: string }[] = [
  { id: 'regras', label: 'Regras e pontuação' },
  { id: 'gestual', label: 'Gestual e comunicação' },
  { id: 'posicionamento', label: 'Posicionamento' },
  { id: 'seguranca', label: 'Segurança dos atletas' },
];
export const CRITERIOS = [
  { id: 'L1', categoria: 'LEVE', pontos: 2, label: 'Posicionamento inadequado / Linha de visão cega' },
  { id: 'L2', categoria: 'LEVE', pontos: 2, label: 'Gestual ou comando de voz impreciso / Hesitação' },
  { id: 'L3', categoria: 'LEVE', pontos: 2, label: 'Demora ou hesitação na consulta ao Vídeo Replay' },
  { id: 'M1', categoria: 'MEDIA', pontos: 5, label: 'Erro de Waza-ari (atribuição indevida ou omissão)' },
  { id: 'M2', categoria: 'MEDIA', pontos: 5, label: 'Aplicação indevida ou omissão de Shido' },
  { id: 'M3', categoria: 'MEDIA', pontos: 5, label: 'Interrupção indevida ou Mate tardio' },
  { id: 'M4', categoria: 'MEDIA', pontos: 5, label: 'Solicitação desnecessária de Vídeo Replay em lance claro' },
  { id: 'G1', categoria: 'GRAVE', pontos: 10, label: 'Inversão de pontuação (atribuir ponto ao atleta errado)' },
  { id: 'G2', categoria: 'GRAVE', pontos: 10, label: 'Divergência de tempo/placar ou reinício sem alinhamento' },
  { id: 'G3', categoria: 'GRAVE', pontos: 10, label: 'Omissão de checagem no Vídeo Replay em lance crítico' },
  { id: 'G4', categoria: 'GRAVE', pontos: 10, label: 'Desalinhamento injustificado entre Central e Mesa de Vídeo' },
  { id: 'GG1', categoria: 'GRAVISSIMA', pontos: 20, label: 'Ippon inexistente ou omitido' },
  { id: 'GG2', categoria: 'GRAVISSIMA', pontos: 20, label: 'Falha grave de segurança dos atletas (sem Mate imediato)' },
  { id: 'GG3', categoria: 'GRAVISSIMA', pontos: 20, label: 'Omissão de Hansoku-make direto' },
  { id: 'GG4', categoria: 'GRAVISSIMA', pontos: 20, label: 'Ignorar correção mandatória do Vídeo Replay' },
] as const;
const categorySeverity: Record<typeof CRITERIOS[number]['categoria'], Severity> = { LEVE: 'leve', MEDIA: 'medio', GRAVE: 'grave', GRAVISSIMA: 'gravissimo' };
export const errors: ErrorItem[] = CRITERIOS.map(item => ({
  id: item.id,
  label: item.label,
  severity: categorySeverity[item.categoria],
  group: item.id === 'L1' ? 'posicionamento' : item.id === 'L2' ? 'gestual' : item.id === 'GG2' || item.id === 'GG3' ? 'seguranca' : 'regras',
  safety: item.id === 'GG2' || item.id === 'GG3',
}));
export const points: Record<Severity, number> = { leve: 2, medio: 5, grave: 10, gravissimo: 20 };
export const severityLabels: Record<Severity, string> = { leve: 'Leve', medio: 'Média', grave: 'Grave', gravissimo: 'Gravíssima' };
export const fightTotal = 20;
export type Role = '' | 'C' | 'L' | 'V';
export const roleLabels: Record<Role, string> = { '': 'Selecionar', C: 'Central', L: 'Lateral', V: 'Vídeo' };
export type Fight = { number: number; role: Role; counts: Record<string, number>; verified: boolean };
export const createFights = (): Fight[] => Array.from({ length: fightTotal }, (_, i) => ({ number: i + 1, role: '', counts: {}, verified: false }));
export const fightDeduction = (fight: Fight) => errors.reduce((sum, item) => sum + (fight.counts[item.id] ?? 0) * points[item.severity], 0);
export function aggregateCounts(fights: Fight[]): Record<string, number> {
  return Object.fromEntries(errors.map(item => [item.id, fights.reduce((sum, fight) => sum + (fight.counts[item.id] ?? 0), 0)]));
}
export const isComplete = (fights: Fight[]) => fights.length === fightTotal && fights.every(fight => fight.role !== '' && fight.verified);
export function restoreFights(value: unknown): Fight[] {
  const saved = Array.isArray(value) ? value : [];
  return createFights().map((fight, i) => {
    const row = saved[i];
    if (!row || typeof row !== 'object') return fight;
    const role: Role = ['C', 'L', 'V'].includes(row.role) ? row.role : '';
    const counts = Object.fromEntries(errors.map(item => {
      const count = row.counts?.[item.id];
      return [item.id, Number.isSafeInteger(count) && count >= 0 ? count : 0];
    }));
    return { ...fight, role, counts, verified: role !== '' && row.verified === true };
  });
}
