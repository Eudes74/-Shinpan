import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Plus, ShieldAlert, X } from 'lucide-react';
import { errors, fightDeduction, fightTotal, points, roleLabels, severityLabels, type ErrorItem, type Fight, type Severity } from '../data/errors';
import { approvalLabels, getResult } from '../data/report';

type Props = {
  fights: Fight[];
  onChange: (index: number, fight: Fight) => void;
  readOnly?: boolean;
};
const severities: Severity[] = ['leve', 'medio', 'grave', 'gravissimo'];
const groupLabels: Record<Severity, string> = { leve: 'Faltas leves', medio: 'Faltas médias', grave: 'Faltas graves', gravissimo: 'Faltas gravíssimas' };

function ErrorPicker({ fight, onSelect, onClose }: { fight: Fight; onSelect: (item: ErrorItem) => void; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog?.showModal();
    return () => { dialog?.close(); document.body.style.overflow = previousOverflow; };
  }, []);
  return <dialog ref={dialogRef} className="error-picker" aria-labelledby="picker-title" aria-describedby="picker-help" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="picker-content">
      <header className="picker-header">
        <div><span>Luta {String(fight.number).padStart(2, '0')} · {fight.role ? roleLabels[fight.role] : 'Função não selecionada'}</span><h2 id="picker-title">Registar Infração / Erro</h2><p id="picker-help">Toque no texto da infração para registá-la e voltar ao combate.</p></div>
        <button type="button" className="picker-close" aria-label="Fechar seleção de infração" onClick={onClose}><X size={22} /></button>
      </header>
      <div className="picker-groups">{severities.map(severity => <section key={severity} className={`picker-group tone-${severity}`} aria-labelledby={`group-${severity}`}>
        <h3 id={`group-${severity}`}><span>{groupLabels[severity]}</span><small>−{points[severity]} pts cada</small></h3>
        <div className="picker-options">{errors.filter(item => item.severity === severity).map(item => <button key={item.id} type="button" onClick={() => onSelect(item)}><span>{item.label}</span><Plus size={19} aria-hidden="true" /></button>)}</div>
      </section>)}</div>
      <footer className="picker-footer">Cada seleção adiciona uma ocorrência. Para repetir a infração, abra novamente; para corrigir, use o × na tag.</footer>
    </div>
  </dialog>;
}

export default function EvaluationSheet({ fights, onChange, readOnly = false }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const result = getResult(fights);
  const totals = [result.light, result.medium, result.grave, result.gravissimo];
  const activeFight = activeIndex === null ? undefined : fights[activeIndex];
  const setCount = (index: number, id: string, value: number) => {
    const fight = fights[index];
    onChange(index, { ...fight, counts: { ...fight.counts, [id]: Math.max(0, value) }, verified: false });
  };
  return <section className="referee-form rounded-2xl bg-slate-100 text-slate-800 [color-scheme:light]" aria-label="Formulário de avaliação prática de arbitragem">
    <header className={`referee-summary z-20 rounded-t-2xl border border-slate-300 bg-white shadow-md ${readOnly ? '' : 'sticky top-0'}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <div><p className="text-xs font-bold text-slate-500">Pontuação atual</p><p className="text-3xl font-black tabular-nums sm:text-4xl" aria-live="polite" aria-atomic="true">{result.score}<span className="text-sm font-medium text-slate-500"> / 100</span></p><p className="text-xs text-slate-500">100 − {result.deduction} em deduções</p></div>
          <div><p className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-extrabold ${result.approval === 'failed' ? 'border-red-300 bg-red-50 text-red-800' : 'border-emerald-300 bg-emerald-50 text-emerald-800'}`} role="status">{approvalLabels[result.approval]}</p><p className="mt-1 text-xs text-slate-500">{result.complete ? 'Resultado final' : 'Status provisório'}</p></div>
        </div>
        <div className="text-right"><p className="text-sm font-extrabold tabular-nums">{result.validated} / {fightTotal}</p><p className="text-xs text-slate-500">combates concluídos</p></div>
      </div>
      <div className="grid grid-cols-4 gap-1.5 px-3 pb-3 sm:gap-3 sm:px-6" aria-label="Infrações por categoria">{severities.map((severity, index) => <div key={severity} className={`referee-counter tone-${severity} flex flex-col items-center justify-center gap-1 rounded-xl border p-2 sm:flex-row sm:justify-between sm:px-3`}><span className="text-center text-[10px] font-bold sm:text-xs">{severityLabels[severity]}s <span className="hidden sm:inline">(−{points[severity]})</span></span><strong className="text-xl font-black leading-none tabular-nums">{totals[index]}</strong></div>)}</div>
      {result.veto && <div className="referee-critical flex items-center gap-3 border-t border-red-900 bg-red-700 px-4 py-3 text-white sm:px-6" role="alert"><ShieldAlert size={24} className="shrink-0" aria-hidden="true" /><div><strong className="block text-xs font-black sm:text-sm">REPROVAÇÃO AUTOMÁTICA (2+ Faltas Gravíssimas)</strong><p className="mt-1 text-xs">{result.gravissimo} ocorrências acumuladas na avaliação.</p></div></div>}
    </header>
    <div className="p-3 sm:p-6">
      <div className="mb-5"><h2 className="text-lg font-extrabold sm:text-xl">Combates · Avaliação prática</h2><p className="mt-1 text-sm text-slate-600">FIJ / CBJ · 20 lutas · FIJ: 85+ pontos · CBJ: 80 a 84 pontos</p>{!readOnly && <p className="mt-2 text-sm leading-relaxed text-slate-600">Selecione a função, registe as infrações pelo nome e marque o visto. Alterar a função ou as infrações retira o visto.</p>}</div>
      <div className="grid items-start gap-4 xl:grid-cols-2">
        {fights.map((fight, index) => {
          const deduction = fightDeduction(fight);
          const recorded = errors.filter(item => (fight.counts[item.id] ?? 0) > 0);
          return <article key={fight.number} className={`fight-card min-w-0 rounded-2xl border bg-white p-4 shadow-sm sm:p-5 ${fight.verified ? 'border-emerald-400' : 'border-slate-300'}`} aria-labelledby={`fight-${fight.number}`}>
            <div className="mb-4 flex items-center justify-between gap-3"><h3 id={`fight-${fight.number}`} className="text-lg font-black">Luta {String(fight.number).padStart(2, '0')}</h3><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${fight.verified ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>{fight.verified && <CheckCircle2 size={14} aria-hidden="true" />}{fight.verified ? 'Concluído' : 'Pendente'}</span></div>
            {readOnly ? <p className="mb-4 text-sm text-slate-600">Função: <strong>{fight.role ? roleLabels[fight.role] : 'Não selecionada'}</strong></p> : <fieldset className="mb-4"><legend className="mb-2 text-xs font-bold text-slate-600">Função do árbitro</legend><div className="grid grid-cols-3 gap-2">{(['C', 'L', 'V'] as const).map(role => <label key={role} className="relative cursor-pointer"><input className="peer sr-only" type="radio" name={`role-${fight.number}`} value={role} checked={fight.role === role} onChange={() => onChange(index, { ...fight, role, verified: false })} /><span className="flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-2 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 peer-checked:border-indigo-600 peer-checked:bg-indigo-50 peer-checked:text-indigo-800 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-indigo-500">{roleLabels[role]}</span></label>)}</div></fieldset>}
            {!readOnly && <button type="button" className="mb-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-indigo-700" aria-label={`Registar infração ou erro na luta ${fight.number}`} aria-haspopup="dialog" onClick={() => setActiveIndex(index)}><Plus size={19} className="shrink-0" aria-hidden="true" />Registar Infração / Erro</button>}
            {recorded.length ? <ul className="flex flex-col gap-2" aria-label={`Infrações registadas na luta ${fight.number}`}>{recorded.map(item => <li key={item.id} className={`referee-tag tone-${item.severity} flex items-center justify-between gap-2 rounded-xl border py-1 pl-3 pr-1 text-sm`}><span className="min-w-0 break-words py-1">{item.label}{fight.counts[item.id] > 1 && <b> ×{fight.counts[item.id]}</b>}<span className="whitespace-nowrap font-bold"> (−{points[item.severity] * fight.counts[item.id]} pts)</span></span>{!readOnly && <button type="button" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-black/10" aria-label={`Remover uma ocorrência de ${item.label} da luta ${fight.number}`} title="Remover uma ocorrência" onClick={() => setCount(index, item.id, fight.counts[item.id] - 1)}><X size={18} aria-hidden="true" /></button>}</li>)}</ul> : <p className="rounded-xl border border-dashed border-slate-200 p-3 text-sm text-slate-500">Nenhuma infração registada.</p>}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3"><div><p className="text-xs font-bold text-slate-500">Subtotal da luta</p><p className={`text-xl font-black tabular-nums ${deduction ? 'text-red-700' : 'text-slate-700'}`}>{deduction ? `−${deduction}` : '0'} <span className="text-xs font-medium">pts</span></p></div>{readOnly ? <span className="text-sm font-bold">{fight.verified ? '✓ Concluído / Visto' : 'Visto pendente'}</span> : <label className={`flex min-h-11 items-center gap-2 text-sm font-bold ${fight.role ? 'cursor-pointer text-slate-700' : 'text-slate-400'}`} title={fight.role ? 'Confirmar este combate' : 'Selecione a função antes de concluir'}><input type="checkbox" className="h-5 w-5 accent-emerald-700" checked={fight.verified} disabled={!fight.role} aria-label={`Concluído / Visto da luta ${fight.number}`} onChange={event => onChange(index, { ...fight, verified: event.target.checked })} />Concluído / Visto</label>}</div>
          </article>;
        })}
      </div>
    </div>
    {!readOnly && activeFight && activeIndex !== null && <ErrorPicker fight={activeFight} onClose={() => setActiveIndex(null)} onSelect={item => {
      setCount(activeIndex, item.id, (activeFight.counts[item.id] ?? 0) + 1);
      setActiveIndex(null);
    }} />}
  </section>;
}
