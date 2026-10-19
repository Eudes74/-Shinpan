import { useEffect, useRef, useState, type ReactNode } from 'react';
import { formatEventDate } from '../data/events';
import { CheckCircle2, Plus, X } from 'lucide-react';
import { errors, fightDeduction, fightScore, fightTotal, points, quickErrors, roleLabels, severityLabels, type ErrorItem, type Fight, type Severity } from '../data/errors';
import { approvalLabels, formatScore, getResult, minimumScore, type ReportForm } from '../data/report';

type Props = {
  fights: Fight[];
  onChange: (index: number, fight: Fight) => void;
  identification: ReportForm;
  eventFields?: ReactNode;
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
        <div className="picker-options">{errors.filter(item => item.severity === severity && !quickErrors.some(quick => quick.id === item.id)).map(item => <button key={item.id} type="button" onClick={() => onSelect(item)}><span>{item.label}</span><Plus size={19} aria-hidden="true" /></button>)}</div>
      </section>)}</div>
      <footer className="picker-footer">Cada seleção adiciona uma ocorrência. Para repetir a infração, abra novamente; para corrigir, use o × na tag.</footer>
    </div>
  </dialog>;
}

export default function EvaluationSheet({ fights, onChange, identification, eventFields, readOnly = false }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const result = getResult(fights);
  const hasEvaluationData = fights.some(fight => fight.role || fight.verified) || result.total > 0;
  const sheetStatuses = [
    { label: 'Aprovado', checked: result.approval === 'approved' },
    { label: 'Em Avaliação', checked: !result.complete },
    { label: 'Reprovado', checked: result.approval === 'failed' },
  ];
  const meanLabel = result.validated ? formatScore(result.score) : '—';
  const totals = [result.light, result.medium, result.grave, result.gravissimo];
  const activeFight = activeIndex === null ? undefined : fights[activeIndex];
  const setCount = (index: number, id: string, value: number) => {
    const fight = fights[index];
    onChange(index, { ...fight, counts: { ...fight.counts, [id]: Math.max(0, value) }, verified: false });
  };
  return <section className="referee-form rounded-2xl bg-slate-100 text-slate-800 [color-scheme:light]" aria-label="Formulário de avaliação prática de arbitragem">
    <header className={`referee-summary z-20 rounded-t-2xl border border-slate-300 bg-white shadow-md ${readOnly ? '' : 'sticky top-0'}`}>
      <div className="sheet-heading px-4 py-3 sm:px-6">
        <h2 className="sheet-title text-lg font-black sm:text-xl">Ficha de Avaliação de Arbitragem</h2>
        {eventFields && !readOnly && <div className="no-print mb-4 border-b border-slate-200 pb-4">{eventFields}</div>}
        <div className="sheet-identification">
          <p className={`sheet-field ${eventFields && !readOnly ? 'hidden print:flex' : ''}`}><strong>Evento / Competição:</strong><span className="sheet-write-line">{identification.event || '\u00a0'}</span></p>
          {identification.eventLocation && <p className={`sheet-field ${eventFields && !readOnly ? 'hidden print:flex' : ''}`}><strong>Local:</strong><span className="sheet-write-line">{identification.eventLocation}</span></p>}
          <p className="sheet-field sheet-candidate"><strong>Árbitro Avaliado:</strong><span className="sheet-write-line">{identification.candidate || '\u00a0'}</span></p>
          <div className="sheet-evaluator-row">
            <p className="sheet-field"><strong>Avaliador:</strong><span className="sheet-write-line">{identification.evaluator || '\u00a0'}</span></p>
            <p className="sheet-field sheet-area"><strong>Tatame/Área:</strong><span className="sheet-write-line">{identification.tatami || '\u00a0'}</span></p>
          </div>
          <p className="sheet-field"><strong>Data:</strong><span className="sheet-date">{formatEventDate(identification.date) || '____/____/______'}</span></p>
          <div className="sheet-statuses" aria-label="Status da avaliação"><strong>Status:</strong>{sheetStatuses.map(status => <span key={status.label} className="sheet-status-option"><span className="sheet-status-box" aria-hidden="true">{hasEvaluationData && status.checked ? '✓' : ''}</span>{status.label}{hasEvaluationData && status.checked && <span className="sr-only"> (marcado)</span>}</span>)}</div>
        </div>
        <div className="sheet-score-grid" aria-label="Resumo de pontuação" aria-live="polite" aria-atomic="true">
          <div className="sheet-score"><span>Base por luta:</span><strong>100 pts</strong></div>
          <div className="sheet-score"><span>Nota mínima exigida:</span><strong>{minimumScore}%</strong></div>
          <div className="sheet-score sheet-final-score"><span>{result.complete ? 'Média Final:' : 'Média Atual:'}</span><strong>[ {meanLabel} ] / 100</strong></div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2" aria-live="polite">
          <p className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-extrabold ${result.approval === 'failed' ? 'border-red-300 bg-red-50 text-red-800' : result.approval === 'approved' ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-amber-300 bg-amber-50 text-amber-900'}`} role="status">{result.complete ? approvalLabels[result.approval] : result.validated ? `Em Avaliação (Média Parcial: ${meanLabel}%)` : 'Em Avaliação — aguardando a primeira luta concluída'}</p>
          <p className="text-xs text-slate-500"><strong className="text-slate-800">{result.validated} / {fightTotal}</strong> lutas concluídas</p>
        </div>
      </div>
      <div className="no-print grid grid-cols-4 gap-1.5 px-3 pb-3 sm:gap-3 sm:px-6" aria-label="Infrações por categoria">{severities.map((severity, index) => <div key={severity} className={`referee-counter tone-${severity} flex flex-col items-center justify-center gap-1 rounded-xl border p-2 sm:flex-row sm:justify-between sm:px-3`}><span className="text-center text-[10px] font-bold sm:text-xs">{severityLabels[severity]}s <span className="hidden sm:inline">(−{points[severity]})</span></span><strong className="text-xl font-black leading-none tabular-nums">{totals[index]}</strong></div>)}</div>
    </header>
    <div className="fight-pages p-3 sm:p-6">
      <div className="no-print mb-5"><h2 className="text-lg font-extrabold sm:text-xl">Combates · Avaliação prática</h2><p className="mt-1 text-sm text-slate-600">20 lutas · 100 pontos por luta · Aprovação com média final de {minimumScore}% ou mais. Apenas lutas concluídas entram na média.</p>{!readOnly && <p className="mt-2 text-sm leading-relaxed text-slate-600">Selecione a função, registe as infrações pelo nome e marque o visto. Alterar a função ou as infrações retira o visto e exclui a luta da média até validá-la novamente.</p>}</div>
      {[0, 10].map(start => <div key={start} className="fight-grid grid items-start gap-4 xl:grid-cols-2">
        {fights.slice(start, start + 10).map((fight, offset) => {
          const index = start + offset;
          const deduction = fightDeduction(fight);
          const recorded = errors.filter(item => (fight.counts[item.id] ?? 0) > 0);
          return <article key={fight.number} className={`fight-card min-w-0 rounded-2xl border bg-white p-4 shadow-sm sm:p-5 ${fight.verified ? 'border-emerald-400' : 'border-slate-300'}`} aria-labelledby={`fight-${fight.number}`}>
            <div className="mb-4 flex items-center justify-between gap-3"><h3 id={`fight-${fight.number}`} className="text-lg font-black">Luta {String(fight.number).padStart(2, '0')}</h3><span className={`fight-state inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${fight.verified ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>{fight.verified && <CheckCircle2 size={14} aria-hidden="true" />}{fight.verified ? 'Concluído' : 'Pendente'}</span></div>
            <div className="fight-digital">
            {readOnly ? <p className="mb-4 text-sm text-slate-600">Função: <strong>{fight.role ? roleLabels[fight.role] : 'Não selecionada'}</strong></p> : <fieldset className="mb-4"><legend className="mb-2 text-xs font-bold text-slate-600">Função do árbitro</legend><div className="grid grid-cols-3 gap-2">{(['C', 'L', 'V'] as const).map(role => <label key={role} className="relative cursor-pointer"><input className="peer sr-only" type="radio" name={`role-${fight.number}`} value={role} checked={fight.role === role} onChange={() => onChange(index, { ...fight, role, verified: false })} /><span className="flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-2 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 peer-checked:border-indigo-600 peer-checked:bg-indigo-50 peer-checked:text-indigo-800 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-indigo-500">{roleLabels[role]}</span></label>)}</div></fieldset>}
            <div className="mb-4 grid gap-3" aria-label={`Marcação rápida de infrações da luta ${fight.number}`}>
              {quickErrors.map(item => {
                const quantity = fight.counts[item.id] ?? 0;
                const label = item.severity === 'medio' ? 'Médio' : severityLabels[item.severity];
                const descriptionId = `fight-${fight.number}-${item.id}-description`;
                return <fieldset key={item.id} className={`referee-counter tone-${item.severity} min-w-0 rounded-xl border px-3 pb-3`} aria-describedby={descriptionId}>
                  <legend className="px-1 text-sm font-bold">{label} (−{points[item.severity]} pts)</legend>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold">qtd: {quantity}</span>
                    {Array.from({ length: 3 }, (_, slot) => <label key={slot} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-current/20 bg-white/70">
                      <input type="checkbox" className="h-5 w-5 accent-indigo-700" checked={quantity > slot} disabled={readOnly} aria-label={`${label}: ${slot + 1} ocorrência${slot ? 's' : ''} na luta ${fight.number}`} onChange={() => setCount(index, item.id, quantity > slot ? slot : slot + 1)} />
                    </label>)}
                    {!readOnly && <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-current/20 bg-white/70 hover:bg-white" aria-label={`Adicionar uma ocorrência de ${label} na luta ${fight.number}`} onClick={() => setCount(index, item.id, quantity + 1)}><Plus size={17} aria-hidden="true" /></button>}
                  </div>
                  <p id={descriptionId} className="mt-2 break-words text-sm leading-relaxed">{item.description}</p>
                </fieldset>;
              })}
            </div>
            {!readOnly && <button type="button" className="mb-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-indigo-700" aria-label={`Registar infração ou erro na luta ${fight.number}`} aria-haspopup="dialog" onClick={() => setActiveIndex(index)}><Plus size={19} className="shrink-0" aria-hidden="true" />Registar Infração / Erro</button>}
            <h4 className="mb-2 text-xs font-bold text-slate-600">Infrações registradas</h4>
            {recorded.length ? <ul className="flex flex-col gap-2" aria-label={`Infrações registadas na luta ${fight.number}`}>{recorded.map(item => <li key={item.id} className={`referee-tag tone-${item.severity} flex items-center justify-between gap-2 rounded-xl border py-1 pl-3 pr-1 text-sm`}><span className="min-w-0 break-words py-1">{item.label}{fight.counts[item.id] > 1 && <b> ×{fight.counts[item.id]}</b>}<span className="whitespace-nowrap font-bold"> (−{points[item.severity] * fight.counts[item.id]} pts)</span></span>{!readOnly && <button type="button" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-black/10" aria-label={`Remover uma ocorrência de ${item.label} da luta ${fight.number}`} title="Remover uma ocorrência" onClick={() => setCount(index, item.id, fight.counts[item.id] - 1)}><X size={18} aria-hidden="true" /></button>}</li>)}</ul> : <p className="rounded-xl border border-dashed border-slate-200 p-3 text-sm text-slate-500">Nenhuma infração registada.</p>}
            {readOnly ? (fight.notes?.trim() && <p className="mt-4 whitespace-pre-wrap break-words text-sm text-slate-600"><strong>Observações:</strong> {fight.notes}</p>) : <label className="mt-4 block text-xs font-bold text-slate-600">Observações da luta<textarea rows={2} maxLength={2000} value={fight.notes || ''} onChange={event => onChange(index, { ...fight, notes: event.target.value })} placeholder="Lance, contexto ou orientação ao árbitro..." className="mt-2 block w-full resize-y rounded-lg border border-slate-300 bg-white p-3 text-sm font-normal text-slate-800 focus:border-indigo-500 focus:outline-indigo-500" /></label>}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3" aria-live="polite"><div><p className={`text-sm font-bold ${deduction ? 'text-red-700' : 'text-slate-600'}`}>Subtotal Deduções: −{deduction} pts</p><p className="mt-1 text-xl font-black tabular-nums text-slate-900">Nota da Luta: {fightScore(fight)} / 100</p><p className="mt-1 text-xs text-slate-500">{fight.role && fight.verified ? 'Incluída na média.' : 'Pendente — fora da média até concluir e marcar o visto.'}</p></div>{readOnly ? <span className="text-sm font-bold">{fight.verified ? '✓ Concluído / Visto' : 'Visto pendente'}</span> : <label className={`flex min-h-11 items-center gap-2 text-sm font-bold ${fight.role ? 'cursor-pointer text-slate-700' : 'text-slate-400'}`} title={fight.role ? 'Confirmar este combate' : 'Selecione a função antes de concluir'}><input type="checkbox" className="h-5 w-5 accent-emerald-700" checked={fight.verified} disabled={!fight.role} aria-label={`Concluído / Visto da luta ${fight.number}`} onChange={event => onChange(index, { ...fight, verified: event.target.checked })} />Concluído / Visto</label>}</div>
            </div>
            <div className="fight-manual" aria-label={`Campos para preenchimento à caneta da luta ${fight.number}`}>
              <p className="fight-manual-hint no-print">Preenchimento manual / impressão</p>
              <div className="fight-manual-role"><strong>Função:</strong><span className="fight-manual-option"><span className="fight-manual-box" aria-hidden="true" />Árbitro Central</span><span className="fight-manual-option"><span className="fight-manual-box" aria-hidden="true" />Lateral</span></div>
              <div className="fight-manual-errors" aria-label="Infrações">
                <span className="fight-manual-option"><span className="fight-manual-box" aria-hidden="true" />Leve</span>
                <span className="fight-manual-option"><span className="fight-manual-box" aria-hidden="true" />Média (ex: Erro gestual)</span>
                <span className="fight-manual-option"><span className="fight-manual-box" aria-hidden="true" />Grave (ex: Ataque falso)</span>
                <span className="fight-manual-option"><span className="fight-manual-box" aria-hidden="true" />Gravíssima</span>
              </div>
              <div className="fight-manual-note">Lance: <span aria-label="Linha para anotação do lance" /></div>
              <div className="fight-manual-deduction"><strong>Subtotal Deduções:</strong><span>[ −____ pts ]</span></div>
              <div className="mt-1 font-bold">Nota da Luta: [ ____ / 100 ]</div>
            </div>
          </article>;
        })}
      </div>)}
    </div>
    {!readOnly && activeFight && activeIndex !== null && <ErrorPicker fight={activeFight} onClose={() => setActiveIndex(null)} onSelect={item => {
      setCount(activeIndex, item.id, (activeFight.counts[item.id] ?? 0) + 1);
      setActiveIndex(null);
    }} />}
  </section>;
}
