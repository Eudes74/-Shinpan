export const categories = ['Regional', 'Estadual', 'Nacional C', 'Nacional B', 'Nacional A', 'FIJ Continental', 'FIJ Internacional'] as const;
export type Category = typeof categories[number];
export type Severity = 'leve' | 'medio' | 'grave';
export type GroupId = 'regras' | 'gestual' | 'posicionamento' | 'seguranca';
export type ErrorItem = { id: string; label: string; severity: Severity; group: GroupId; safety?: boolean };
export type Group = { id: GroupId; label: string; short: string; description: string };

export const groups: Group[] = [
  { id: 'regras', label: 'Regras e Pontuação', short: 'Regras', description: 'Decisões, marcações e aplicação das regras' },
  { id: 'gestual', label: 'Gestual e Postura', short: 'Gestual', description: 'Comunicação, sinais e presença no tatame' },
  { id: 'posicionamento', label: 'Posicionamento e Deslocamento', short: 'Posicionamento', description: 'Movimentação e visão de combate' },
  { id: 'seguranca', label: 'Segurança e Combate', short: 'Segurança', description: 'Integridade dos atletas e continuidade da luta' },
];

export const errors: ErrorItem[] = [
  { id: 'inversao', group: 'regras', severity: 'grave', label: 'Inversão de pontuação (atribuir golpe ao atleta que sofreu a queda)' },
  { id: 'hansoku', group: 'regras', severity: 'grave', label: 'Não aplicação de Hansoku-make obrigatório (ações perigosas, head-dive, chaves ilegais)' },
  { id: 'ippon', group: 'regras', severity: 'grave', label: 'Confundir Ippon com Waza-ari no encerramento da luta' },
  { id: 'wazaari', group: 'regras', severity: 'medio', label: 'Marcar Waza-ari sem impacto ou critérios técnicos da FIJ' },
  { id: 'osaekomi', group: 'regras', severity: 'medio', label: 'Hesitação excessiva para assinalar Osaekomi ou Toketa' },
  { id: 'passividade', group: 'regras', severity: 'medio', label: 'Omissão em punir passividade evidente ou falsa investida no tempo correto' },
  { id: 'sincronia', group: 'regras', severity: 'leve', label: 'Falha de sincronia entre comando de voz e gesto ao assinalar pontuação' },
  { id: 'gestos', group: 'gestual', severity: 'medio', label: 'Utilização de gestos não padronizados pela FIJ ou sinais inventados' },
  { id: 'voz', group: 'gestual', severity: 'medio', label: 'Comandos de voz inaudíveis para a mesa técnica e atletas' },
  { id: 'braco', group: 'gestual', severity: 'leve', label: 'Braço flexionado ou sem firmeza ao sinalizar Ippon, Waza-ari ou Shido' },
  { id: 'postura', group: 'gestual', severity: 'leve', label: 'Postura desleixada, braços cruzados ou mãos nos bolsos fora de ação' },
  { id: 'judogi', group: 'gestual', severity: 'leve', label: 'Esquecer de autorizar ajuste de judogi (Sono-mama / Yoshi descoordenados)' },
  { id: 'obstrucao', group: 'posicionamento', severity: 'grave', label: 'Obstruir fisicamente a trajetória de queda ou projeção dos atletas' },
  { id: 'camera', group: 'posicionamento', severity: 'medio', label: 'Ficar de costas para o lance principal ou bloquear a visão da câmera do Care System' },
  { id: 'newaza', group: 'posicionamento', severity: 'medio', label: 'Proximidade excessiva no Ne-waza impedindo visão da linha limítrofe' },
  { id: 'passo', group: 'posicionamento', severity: 'leve', label: 'Cruzar as pernas no deslocamento (não usar passo Tsugi-ashi)' },
  { id: 'borda', group: 'posicionamento', severity: 'leve', label: 'Permanecer estático colado na borda externa do tatame' },
  { id: 'shime', group: 'seguranca', severity: 'grave', safety: true, label: 'Atrasar comando de Mate com judoca desacordado em Shime-waza' },
  { id: 'maitta', group: 'seguranca', severity: 'grave', safety: true, label: 'Permitir continuidade de ação após desistência declarada (Maitta)' },
  { id: 'mate', group: 'seguranca', severity: 'medio', label: 'Interrupção prematura (Mate indevido) em transição legítima de Tachi-waza para Ne-waza' },
  { id: 'sangramento', group: 'seguranca', severity: 'medio', label: 'Demora em paralisar o combate mediante sangramento ativo' },
  { id: 'reinicio', group: 'seguranca', severity: 'leve', label: 'Não reposicionar atletas no local correto de reinício após o Mate' },
];

export const points: Record<Severity, number> = { leve: 2, medio: 5, grave: 15 };
export const severityLabels: Record<Severity, string> = { leve: 'Leve', medio: 'Médio', grave: 'Grave' };
