import { Activity, ArrowLeft, MessageCircle, RotateCcw } from 'lucide-react';
import { points, severityLabels, type Fight } from '../data/errors';
import { approvalLabels, formatScore, getResult, minimumScore, shareSummary, type ReportForm } from '../data/report';
import EvaluationSheet from './EvaluationSheet';
import EvaluationPdfExport from './EvaluationPdfExport';

type Props = {
  form: ReportForm;
  fights: Fight[];
  notes: string;
  onResume: () => void;
  onReset: () => void;
  onCandidateEmailChange: (email: string) => void;
};

export default function Report({ form, fights, notes, onResume, onReset, onCandidateEmailChange }: Props) {
  const result = getResult(fights);
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(shareSummary(form, result, notes, fights))}`;
  return <>
    <header className="no-print border-b border-line bg-[#0d1627]"><div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-5 py-5 sm:px-8"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white"><Activity size={22} strokeWidth={2.5} /></span><span className="text-lg font-black text-white">SHINPAN<span className="text-indigo-400">.</span></span></div><span className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-200">Avaliação encerrada</span></div></header>
    <main className="report-print mx-auto max-w-[1600px] px-4 pb-20 pt-8 sm:px-8">
      <div className="no-print mb-6 flex flex-wrap items-start justify-between gap-4"><div><span className="eyebrow">DEVOLUTIVA DE ARBITRAGEM</span><h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white">Relatório de avaliação</h1><p className="mt-2 text-sm text-slate-400">Avaliação individual das 20 lutas, com resultado pela média aritmética das notas.</p></div><span className="rounded-lg border border-line bg-panel px-4 py-2 text-xs font-bold text-slate-300">TATAME {form.tatami}</span></div>
      <section className={`no-print report-outcome report-outcome-${result.approval === 'pending' ? 'incomplete' : result.approval === 'failed' ? 'failed' : 'approved'}`} aria-label="Resultado da avaliação">
        <p className={`report-status report-status-${result.approval === 'pending' ? 'incomplete' : result.approval === 'failed' ? 'failed' : 'approved'}`}>{result.complete ? `Resultado Final: ${approvalLabels[result.approval].toUpperCase()}` : 'Em Avaliação'}</p>
        <p className="mt-4 text-2xl font-extrabold text-white">{result.complete ? 'Média Geral Obtida' : 'Média Parcial'}: {result.validated ? `${formatScore(result.score)}%` : '—'}</p>
        <p className="mt-3 text-sm text-slate-300">Nota Mínima Exigida: {minimumScore}% · {result.validated} / 20 lutas concluídas.</p>
        <p className="mt-3 text-xs leading-relaxed text-slate-400">Cada luta começa com 100 pontos e tem nota mínima de 0. As infrações descontam apenas da respectiva luta. A média considera somente lutas com função definida e visto. Após as 20 lutas, média de {minimumScore}% ou mais: Aprovado; abaixo: Reprovado.</p>
      </section>
      <section className="no-print my-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Identificação">
        <div className="summary-tile"><p className="report-label">Candidato</p><p className="mt-2 text-lg font-bold text-white">{form.candidate}</p><p className="mt-1 text-sm text-slate-400">{form.federation || 'Federação não informada'}</p></div>
        <div className="summary-tile"><p className="report-label">Categorias</p><p className="mt-2 text-sm text-white">Atual: <strong>{form.current}</strong></p><p className="mt-1 text-sm text-white">Pleiteada: <strong>{form.target}</strong></p></div>
        <div className="summary-tile"><p className="report-label">Avaliador</p><p className="mt-2 text-sm font-semibold text-white">{form.evaluator || 'Não informado'}</p></div>
        <div className="summary-tile"><p className="report-label">Evento / Área</p><p className="mt-2 text-sm font-semibold text-white">{form.event || 'Evento não informado'} · Tatame {form.tatami}</p></div>
      </section>
      <EvaluationPdfExport form={form} fights={fights} notes={notes} onCandidateEmailChange={onCandidateEmailChange} />
      <div className="mt-6"><EvaluationSheet fights={fights} onChange={() => {}} identification={form} readOnly /></div>
      <section className="mt-6 rounded-2xl border border-line bg-panel p-5 sm:p-7"><h2 className="text-lg font-bold text-white">Detalhamento das ocorrências</h2><p className="mt-2 text-sm text-slate-400">{result.total} ocorrências · {result.deduction} pontos em deduções registradas, aplicadas separadamente em cada luta, respeitando a nota mínima de 0. O resultado final é a média das notas, não uma pontuação cumulativa.</p>
        {result.recorded.length ? <ul className="mt-5 divide-y divide-line">{result.recorded.map(({ item, quantity }) => <li key={item.id} className="flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0 last:pb-0"><div className="min-w-0 flex-1"><span className={`severity-tag severity-tag-${item.severity}`}>{severityLabels[item.severity]}</span><p className="mt-2 text-sm leading-relaxed text-slate-200">{item.label}</p><p className="mt-1 text-xs text-slate-400">Lutas: {fights.filter(fight => fight.counts[item.id]).map(fight => `${String(fight.number).padStart(2, '0')} (×${fight.counts[item.id]})`).join(', ')}</p></div><div className="shrink-0 text-right text-sm"><strong className="text-white">×{quantity}</strong><p className="text-slate-400">−{quantity * points[item.severity]} pts</p></div></li>)}</ul> : <p className="mt-5 text-sm text-slate-400">Nenhuma ocorrência registrada nos 20 combates.</p>}
      </section>
      {notes.trim() && <section className="mt-6 rounded-2xl border border-line bg-panel p-5 sm:p-7"><h2 className="text-lg font-bold text-white">Observações</h2><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-300">{notes}</p></section>}
      <div className="no-print mt-8 grid gap-3 sm:grid-cols-2"><a href={whatsapp} target="_blank" rel="noopener noreferrer" className="secondary-button text-center"><MessageCircle size={18} />Compartilhar resumo via WhatsApp</a><button type="button" onClick={onResume} className="secondary-button"><ArrowLeft size={18} />Retomar avaliação</button><button type="button" onClick={onReset} className="secondary-button"><RotateCcw size={18} />Nova avaliação</button></div><p className="no-print mt-4 text-center text-xs text-slate-500">O WhatsApp compartilha apenas o resumo e requer conexão à internet.</p>
    </main>
  </>;
}
