import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Minus, Pause, Play, Plus, RotateCcw, Search, Star, X } from 'lucide-react';
import { categories, CRITERIOS } from '../data/errors';

type Criterion = 'postura' | 'regras' | 'shido' | 'mesa';
type Infraction = { id: string; name: string; category: string; points: number };
type Candidate = {
  id: number;
  name: string;
  role: string;
  level: string;
  criteria: Record<Criterion, number>;
  selectedInfractions: Infraction[];
  notes: string;
  isCompleted: boolean;
};
const criteria: { label: string; key: Criterion }[] = [
  { label: 'Postura / Gestual', key: 'postura' },
  { label: 'Domínio de Regras', key: 'regras' },
  { label: 'Aplicação de Penalidades / Shido', key: 'shido' },
  { label: 'Comunicação com a Mesa', key: 'mesa' },
];
const infractions: Infraction[] = CRITERIOS.map(item => ({ id: item.id, name: item.label, category: item.categoria, points: item.pontos }));
const favoriteInfractions = infractions.slice(0, 10);
const createCandidates = (): Candidate[] => Array.from({ length: 4 }, (_, index) => ({
  id: index + 1, name: `Candidato ${index + 1}`, role: 'Central', level: 'Regional',
  criteria: { postura: 0, regras: 0, shido: 0, mesa: 0 }, selectedInfractions: [], notes: '', isCompleted: false,
}));
const calculateScore = (candidate: Candidate) => Math.max(0,
  Object.values(candidate.criteria).reduce((sum, value) => sum + value, 0) * 5
  - candidate.selectedInfractions.reduce((sum, item) => sum + item.points, 0));

export default function SimultaneousEvaluation({ onBack, event, tatami }: { onBack: () => void; event: string; tatami: string }) {
  const [candidateCount, setCandidateCount] = useState(1);
  const [candidates, setCandidates] = useState(createCandidates);
  const [activeDropdownCandidateId, setActiveDropdownCandidateId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setSeconds(value => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);
  const updateCandidate = (id: number, update: (candidate: Candidate) => Candidate) => {
    setCandidates(previous => previous.map(candidate => candidate.id === id ? update(candidate) : candidate));
  };
  const updateCriterion = (id: number, key: Criterion, delta: number) => updateCandidate(id, candidate => ({
    ...candidate, criteria: { ...candidate.criteria, [key]: Math.max(0, Math.min(5, candidate.criteria[key] + delta)) },
  }));
  const addInfraction = (id: number, infraction: Infraction) => {
    updateCandidate(id, candidate => ({ ...candidate, selectedInfractions: [...candidate.selectedInfractions, infraction] }));
    setActiveDropdownCandidateId(null);
    setSearchQuery('');
  };
  const removeInfraction = (id: number, index: number) => updateCandidate(id, candidate => ({
    ...candidate, selectedInfractions: candidate.selectedInfractions.filter((_, itemIndex) => itemIndex !== index),
  }));
  const filteredSearchInfractions = infractions.filter(item =>
    `${item.name} ${item.category}`.toLocaleLowerCase('pt-BR').includes(searchQuery.toLocaleLowerCase('pt-BR')));
  const reset = () => {
    if (!window.confirm('Reiniciar somente a avaliação simultânea? Os critérios voltarão a zero e as infrações e observações serão apagadas. A avaliação por luta não será alterada.')) return;
    setCandidates(createCandidates()); setSeconds(0); setRunning(false); setActiveDropdownCandidateId(null); setSearchQuery('');
  };
  const elapsed = `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  return <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-8">
    <header className="space-y-5">
      <button type="button" onClick={onBack} className="secondary-button"><ArrowLeft size={16} /> Avaliação por luta</button>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-bold tracking-widest text-cyan-400">MODO TATAMI · PAINEL MULTICANDIDATO</p><h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Avaliação Simultânea de Árbitros</h1><p className="mt-2 text-sm text-slate-400">Tatame {tatami || '1'}{event && ` · ${event}`}</p></div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xl text-slate-200" aria-label="Tempo de avaliação">{elapsed}</span>
          <button type="button" className="secondary-button" onClick={() => setRunning(value => !value)}>{running ? <Pause size={15} /> : <Play size={15} />}{running ? 'Pausar' : 'Iniciar'}</button>
          <button type="button" className="secondary-button" onClick={reset}><RotateCcw size={15} /> Reiniciar</button>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-slate-400">Cada critério começa em 0/5. Total de 0 a 100: soma dos critérios × 5, menos as infrações, sem ficar negativo. Este painel é independente da ficha por luta e fica disponível enquanto esta página estiver aberta.</p>
    </header>
    <section className="space-y-3 rounded-xl border border-slate-800 bg-[#0c1524] p-5">
      <h2 className="text-xs font-bold text-slate-300">Quantos árbitros vai avaliar em simultâneo?</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[1, 2, 3, 4].map(num => <button key={num} type="button" aria-pressed={candidateCount === num} onClick={() => { setCandidateCount(num); setActiveDropdownCandidateId(null); }} className={`rounded-xl border p-4 text-center transition-all ${candidateCount === num ? 'border-cyan-500 bg-cyan-950/20 text-cyan-300 shadow-md shadow-cyan-950/30' : 'border-slate-800 bg-[#080e18] text-slate-400 hover:border-slate-700'}`}><div className="font-mono text-2xl font-bold">{num}</div><div className="mt-1 text-xs text-slate-400">{num === 1 ? 'candidato' : 'candidatos'}</div></button>)}</div>
    </section>
    <main className={`grid grid-cols-1 gap-6 ${candidateCount > 1 ? 'md:grid-cols-2' : 'mx-auto w-full max-w-xl'}`}>
      {candidates.slice(0, candidateCount).map(cand => {
        const totalScore = calculateScore(cand);
        const penaltyTotal = cand.selectedInfractions.reduce((sum, item) => sum + item.points, 0);
        return <article key={cand.id} className={`space-y-4 rounded-xl border bg-[#0c1524] p-5 shadow-xl transition-all ${cand.isCompleted ? 'border-emerald-600/60' : 'border-slate-800'}`}>
          <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div className="min-w-0 space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-cyan-400">Função
                <select aria-label={`Função do candidato ${cand.id}`} value={cand.role} onChange={e => updateCandidate(cand.id, c => ({ ...c, role: e.target.value }))} className="mt-1 block w-full rounded border border-slate-800 bg-[#080e18] p-1 text-xs text-slate-200">
                  {['Central', 'Lateral', 'Vídeo'].map(role => <option key={role}>{role}</option>)}
                </select>
              </label>
              <input aria-label={`Nome do candidato ${cand.id}`} maxLength={120} value={cand.name} onChange={e => updateCandidate(cand.id, c => ({ ...c, name: e.target.value }))} className="w-full rounded border border-slate-800 bg-[#080e18] p-1.5 text-sm font-bold text-slate-100" />
              <select aria-label={`Categoria do candidato ${cand.id}`} value={cand.level} onChange={e => updateCandidate(cand.id, c => ({ ...c, level: e.target.value }))} className="w-full rounded border border-slate-800 bg-[#080e18] p-1 text-xs text-slate-400">
                {categories.map(level => <option key={level}>{level}</option>)}
              </select>
            </div>
            <div className="shrink-0 text-right">
              <span className="block font-mono text-3xl font-extrabold leading-none text-slate-100" aria-label={`Nota total de ${cand.name}`}>{totalScore}</span>
              <span className={`text-[11px] ${cand.isCompleted ? 'font-semibold text-emerald-400' : 'text-slate-400'}`}>{cand.isCompleted ? 'Finalizado' : 'Em andamento'}</span>
            </div>
          </div>
          <div className="space-y-2">
            {criteria.map(item => <div key={item.key} className="flex items-center justify-between gap-2 rounded-lg border border-slate-800/90 bg-[#080e18] px-3.5 py-2">
              <span className="text-xs font-medium text-slate-300 md:text-sm">{item.label}</span>
              <div className="flex shrink-0 items-center gap-2">
                <button type="button" aria-label={`Diminuir ${item.label} de ${cand.name}`} disabled={cand.criteria[item.key] === 0} onClick={() => updateCriterion(cand.id, item.key, -1)} className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-30"><Minus size={13} /></button>
                <span className="w-8 text-center font-mono text-xs font-semibold text-slate-200 md:text-sm">{cand.criteria[item.key]}/5</span>
                <button type="button" aria-label={`Aumentar ${item.label} de ${cand.name}`} disabled={cand.criteria[item.key] === 5} onClick={() => updateCriterion(cand.id, item.key, 1)} className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-30"><Plus size={13} /></button>
              </div>
            </div>)}
          </div>
          <div className="relative space-y-3 rounded-lg border border-amber-950/40 bg-[#080e18]/80 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-medium tracking-wide text-amber-300">Faltas / intervenções ({cand.selectedInfractions.length} · {penaltyTotal} pts)</span>
              <button type="button" aria-expanded={activeDropdownCandidateId === cand.id} onClick={() => { setActiveDropdownCandidateId(activeDropdownCandidateId === cand.id ? null : cand.id); setSearchQuery(''); }} className="flex items-center gap-1 rounded bg-slate-800/90 px-2.5 py-1 text-[11px] font-semibold text-slate-200 transition-colors hover:bg-slate-700 hover:text-white"><Plus size={12} /> Adicionar Infração</button>
            </div>
            {activeDropdownCandidateId === cand.id && <div className="absolute left-3 right-3 top-10 z-30 space-y-2 rounded-lg border border-slate-700 bg-[#0c1524] p-2 shadow-2xl">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                <input type="text" aria-label="Buscar infração" placeholder="Buscar infração..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Escape') setActiveDropdownCandidateId(null); }} className="w-full rounded border border-slate-700 bg-[#070d14] py-1.5 pl-8 pr-8 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none" autoFocus />
                <button type="button" aria-label="Fechar busca" onClick={() => setActiveDropdownCandidateId(null)} className="absolute right-2 top-2 text-slate-400"><X size={14} /></button>
              </div>
              <div className="max-h-48 space-y-1 overflow-y-auto">
                {filteredSearchInfractions.length === 0 ? <p className="py-2 text-center text-xs text-slate-500">Nenhuma infração encontrada</p> : filteredSearchInfractions.map(inf => <button key={inf.id} type="button" onClick={() => addInfraction(cand.id, inf)} className="flex w-full items-center justify-between rounded p-1.5 text-left text-xs transition-colors hover:bg-slate-800/80">
                  <span className="truncate pr-2 text-slate-300">{inf.name} <span className="text-[10px] text-slate-500">· {inf.category}</span></span>
                  <span className="shrink-0 font-mono font-semibold text-rose-400">{inf.points} pts</span>
                </button>)}
              </div>
            </div>}
            <div className="grid grid-cols-2 gap-1.5">
              {favoriteInfractions.map(inf => <button key={inf.id} type="button" onClick={() => addInfraction(cand.id, inf)} title={inf.name} className="group flex items-center justify-between rounded border border-slate-800 bg-[#0c1524] px-2 py-1.5 text-left text-[11px] transition-colors hover:border-slate-700">
                <span className="flex min-w-0 items-center gap-1.5 text-slate-300 group-hover:text-white"><Star size={10} className="shrink-0 fill-amber-400 text-amber-400" /><span className="truncate">{inf.name}</span></span>
                <span className="ml-1 shrink-0 font-mono text-[10px] text-rose-400">{inf.points}</span>
              </button>)}
            </div>
            {cand.selectedInfractions.length > 0 && <div className="flex flex-wrap gap-1.5 border-t border-slate-800/80 pt-2">
              {cand.selectedInfractions.map((inf, index) => <span key={`${inf.id}-${index}`} className="inline-flex max-w-full items-center gap-1 rounded border border-red-900/60 bg-red-950/40 px-2 py-0.5 text-[11px] text-red-200">
                <span className="max-w-[200px] truncate">{inf.name} ({inf.points} pts)</span>
                <button type="button" aria-label={`Remover ${inf.name} de ${cand.name}`} onClick={() => removeInfraction(cand.id, index)} className="ml-0.5 shrink-0 hover:text-white"><X size={12} /></button>
              </span>)}
            </div>}
          </div>
          <textarea aria-label={`Observações de ${cand.name}`} placeholder="Observações do candidato" value={cand.notes} maxLength={5000} onChange={e => updateCandidate(cand.id, c => ({ ...c, notes: e.target.value }))} rows={2} className="w-full rounded-lg border border-slate-800 bg-[#080e18] p-2.5 text-xs text-slate-200 placeholder-slate-500 transition-colors focus:border-cyan-500 focus:outline-none" />
          <button type="button" aria-pressed={cand.isCompleted} onClick={() => updateCandidate(cand.id, c => ({ ...c, isCompleted: !c.isCompleted }))} className={`flex w-full items-center justify-center gap-1 rounded-lg py-2 text-xs font-semibold transition-colors ${cand.isCompleted ? 'border border-emerald-600 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/40' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}>
            {cand.isCompleted && <Check size={14} />}{cand.isCompleted ? 'Avaliação Finalizada' : 'Marcar como finalizado'}
          </button>
        </article>;
      })}
    </main>
    <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-4 text-xs text-slate-500"><div>SHINPAN · Avaliação de arbitragem de judô</div><div>Precisão em cada decisão.</div></footer>
  </div>;
}
