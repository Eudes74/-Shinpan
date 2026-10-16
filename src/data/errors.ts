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
export const errors: ErrorItem[] = [
  { id: 'L1', severity: 'leve', group: 'posicionamento', label: 'Posicionamento inadequado / Linha de visão cega' },
  { id: 'L2', severity: 'leve', group: 'gestual', label: 'Gestual ou comando de voz impreciso / Hesitação' },
  { id: 'L3', severity: 'leve', group: 'regras', label: 'Demora ou hesitação na consulta ao Vídeo Replay' },
  { id: 'M1', severity: 'medio', group: 'regras', label: 'Erro de Waza-ari (atribuição indevida ou omissão)' },
  { id: 'M2', severity: 'medio', group: 'regras', label: 'Aplicação indevida ou omissão de Shido' },
  { id: 'M3', severity: 'medio', group: 'regras', label: 'Interrupção indevida ou Mate tardio' },
  { id: 'M4', severity: 'medio', group: 'regras', label: 'Solicitação desnecessária de Vídeo Replay em lance claro' },
  { id: 'G1', severity: 'grave', group: 'regras', label: 'Inversão de pontuação (atribuir ponto ao atleta errado)' },
  { id: 'G2', severity: 'grave', group: 'regras', label: 'Divergência de tempo/placar ou reinício sem alinhamento' },
  { id: 'G3', severity: 'grave', group: 'regras', label: 'Omissão de checagem no Vídeo Replay em lance crítico' },
  { id: 'G4', severity: 'grave', group: 'regras', label: 'Desalinhamento injustificado entre Central e Mesa de Vídeo' },
  { id: 'GG1', severity: 'gravissimo', group: 'regras', label: 'Erro crítico: Ippon inexistente (de Ippon para nada) ou omitido' },
  { id: 'GG2', severity: 'gravissimo', group: 'seguranca', safety: true, label: 'Falha grave de segurança dos atletas (sem Mate imediato)' },
  { id: 'GG3', severity: 'gravissimo', group: 'seguranca', safety: true, label: 'Omissão de Hansoku-make direto (ações perigosas/conduta grave)' },
  { id: 'GG4', severity: 'gravissimo', group: 'regras', label: 'Ignorar correção mandatória do Vídeo Replay / Comissão' },
];
export const points: Record<Severity, number> = { leve: 2, medio: 5, grave: 10, gravissimo: 20 };
export const severityLabels: Record<Severity, string> = { leve: 'Leve', medio: 'Média', grave: 'Grave', gravissimo: 'Gravíssima' };
export const fightTotal = 20;
export type Role = '' | 'C' | 'L' | 'V';
export const roleLabels: Record<Role, string> = { '': 'Selecionar', C: 'Central', L: 'Lateral', V: 'Vídeo' };
export type Fight = { number: number; role: Role; counts: Record<string, number>; verified: boolean };
export const createFights = (): Fight[] => Array.from({ length: fightTotal }, (_, i) => ({ number: i + 1, role: '', counts: {}, verified: false }));
export const maxPerFight = (id: string) => id === 'M2' ? 5 : ['M1', 'M3', 'M4'].includes(id) ? 3 : 1;
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
      return [item.id, Number.isSafeInteger(count) && count >= 0 ? Math.min(count, maxPerFight(item.id)) : 0];
    }));
    return { ...fight, role, counts, verified: role !== '' && row.verified === true };
  });
}
