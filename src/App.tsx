import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Activity, ArrowRight, ChevronRight, ClipboardCheck, Flag, Info, MapPin, Plus, ShieldCheck } from 'lucide-react';
import { categories, createFights, restoreFights, type Fight } from './data/errors';
import { getResult, type ReportForm } from './data/report';
import Report from './components/Report';
import EvaluationSheet from './components/EvaluationSheet';

const storageKey = 'shinpan-avaliacao-v2';
type Form = ReportForm;
type Session = { screen: 'setup' | 'live' | 'finished'; form: Form; fights: Fight[]; notes: string; legacyNotice: boolean };
const initial: Session = {
  screen: 'setup',
  form: { candidate: '', federation: '', current: 'Regional', target: 'Estadual', evaluator: '', event: '', tatami: '1' },
  fights: createFights(), notes: '', legacyNotice: false,
};
function restore(): Session {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      const legacy = localStorage.getItem('shinpan-avaliacao-v1');
      if (!legacy) return initial;
      const saved = JSON.parse(legacy);
      return { ...initial, form: { ...initial.form, ...saved.form }, legacyNotice: true };
    }
    const saved = JSON.parse(raw) as Partial<Session>;
    if (!saved.form || !Array.isArray(saved.fights) || !['setup', 'live', 'finished'].includes(saved.screen ?? '')) return initial;
    const fights = restoreFights(saved.fights);
    return { screen: saved.screen === 'finished' && !getResult(fights).complete ? 'live' : saved.screen!, form: { ...initial.form, ...saved.form }, fights, notes: typeof saved.notes === 'string' ? saved.notes : '', legacyNotice: saved.legacyNotice === true };
  } catch { return initial; }
}
function Brand() {
  return <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-glow"><Activity size={22} strokeWidth={2.5} /></span><span className="text-lg font-black tracking-tight text-white">SHINPAN<span className="text-indigo-400">.</span></span></div>;
}
function Field({ label, children, optional = false }: { label: string; children: ReactNode; optional?: boolean }) {
  return <label className="block space-y-2"><span className="block text-sm font-semibold text-slate-200">{label}{optional && <span className="ml-2 text-xs font-normal text-slate-500">Opcional</span>}</span>{children}</label>;
}
export default function App() {
  const [session, setSession] = useState<Session>(restore);
  const { screen, form, fights, notes, legacyNotice } = session;
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(session)); } catch { /* armazenamento indisponível */ } }, [session]);
  const result = getResult(fights);
  const updateForm = (key: keyof Form, value: string) => setSession(prev => ({ ...prev, form: { ...prev.form, [key]: value } }));
  const updateFight = (index: number, fight: Fight) => setSession(prev => ({ ...prev, fights: prev.fights.map((row, i) => i === index ? fight : row) }));
  const start = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (form.candidate.trim()) setSession(prev => ({ ...prev, form: { ...prev.form, candidate: prev.form.candidate.trim() }, screen: 'live' })); };
  const finish = () => { if (result.complete) setSession(prev => ({ ...prev, screen: 'finished' })); };
  const reset = () => { if (window.confirm('Iniciar uma nova avaliação? O registro atual será apagado deste dispositivo.')) setSession({ ...initial, fights: createFights() }); };
  return <div className="min-h-screen bg-ink text-slate-100">
    {legacyNotice && <div className="no-print mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm text-amber-200" role="status"><p>Há uma avaliação no modelo antigo salva neste dispositivo. Os dados de identificação foram mantidos; as ocorrências antigas não foram convertidas, pois não indicam a luta. O registro antigo permanece preservado neste navegador.</p><button type="button" className="secondary-button" onClick={() => setSession(prev => ({ ...prev, legacyNotice: false }))}>Entendi</button></div>}
    {screen === 'setup' && <>
      <header className="border-b border-line bg-[#0d1627]"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8"><Brand /><span className="hidden text-xs font-semibold tracking-widest text-slate-500 sm:inline">SISTEMA DE AVALIAÇÃO DE ARBITRAGEM</span></div></header>
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-8 sm:pt-16"><div className="grid items-start gap-10 lg:grid-cols-[.85fr_1.15fr] lg:gap-16"><div className="lg:sticky lg:top-16"><span className="eyebrow">AVALIAÇÃO NO TATAME</span><h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">Decisões precisas.<br /><span className="text-indigo-400">Avaliações justas.</span></h1><p className="mt-5 max-w-md leading-relaxed text-slate-400">Uma ferramenta para avaliar a arbitragem de judô em tempo real, com registro rápido e pontuação automática.</p><div className="mt-10 grid max-w-md gap-3"><div className="feature"><span className="feature-icon"><Plus size={19} /></span><div><p className="font-semibold text-white">Registro em um toque</p><p className="text-sm text-slate-400">Checklist preparado para a beira do tatame.</p></div></div><div className="feature"><span className="feature-icon"><Activity size={19} /></span><div><p className="font-semibold text-white">Pontuação em tempo real</p><p className="text-sm text-slate-400">Acompanhe cada ocorrência instantaneamente.</p></div></div><div className="feature"><span className="feature-icon"><ShieldCheck size={19} /></span><div><p className="font-semibold text-white">Dados no dispositivo</p><p className="text-sm text-slate-400">Continue sua avaliação mesmo sem internet.</p></div></div></div></div>
      <form onSubmit={start} className="rounded-2xl border border-line bg-panel p-5 shadow-2xl shadow-black/20 sm:p-8"><div className="flex items-start gap-3 border-b border-line pb-6"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400"><ClipboardCheck size={22} /></span><div><h2 className="text-xl font-bold text-white">Nova avaliação</h2><p className="mt-1 text-sm text-slate-400">Preencha os dados para começar.</p></div></div><div className="mt-6 grid gap-5 sm:grid-cols-2"><div className="sm:col-span-2"><Field label="Nome do candidato"><input className="field" autoComplete="name" required maxLength={120} placeholder="Nome completo do candidato" value={form.candidate} onChange={e => updateForm('candidate', e.target.value)} /></Field></div><Field label="Federação / Associação" optional><input className="field" maxLength={120} placeholder="Ex.: Federação Estadual" value={form.federation} onChange={e => updateForm('federation', e.target.value)} /></Field><Field label="Nome do avaliador" optional><input className="field" maxLength={120} placeholder="Nome do avaliador" value={form.evaluator} onChange={e => updateForm('evaluator', e.target.value)} /></Field><Field label="Categoria atual"><select className="field" value={form.current} onChange={e => updateForm('current', e.target.value)}>{categories.slice(0, 6).map(c => <option key={c}>{c}</option>)}</select></Field><Field label="Categoria pleiteada"><select className="field" value={form.target} onChange={e => updateForm('target', e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select></Field><Field label="Evento / Campeonato" optional><input className="field" maxLength={120} placeholder="Ex.: Campeonato Estadual" value={form.event} onChange={e => updateForm('event', e.target.value)} /></Field><Field label="Tatame / Área"><select className="field" value={form.tatami} onChange={e => updateForm('tatami', e.target.value)}>{Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>Tatame {i + 1}</option>)}</select></Field></div><div className="mt-7 rounded-xl border border-indigo-400/20 bg-indigo-500/5 p-4 text-sm text-slate-400"><Info size={17} className="mr-2 inline-block align-text-bottom text-indigo-400" />O progresso é salvo automaticamente neste dispositivo.</div><button type="submit" className="primary-button mt-6 w-full">Iniciar Avaliação no Tatame <ArrowRight size={19} /></button></form></div></main>
    </>}
    {screen === 'live' && <>
      <header className="no-print border-b border-line bg-[#0d1627]"><div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6"><Brand /><div className="text-sm"><strong className="text-white">{form.candidate}</strong><p className="mt-1 text-xs text-slate-400">{form.current} → {form.target} · Tatame {form.tatami}</p></div><button type="button" onClick={finish} disabled={!result.complete} title={result.complete ? 'Abrir relatório' : 'Valide as 20 lutas antes de finalizar'} className="secondary-button disabled:opacity-40">Finalizar avaliação <ChevronRight size={17} /></button></div></header>
      <main className="evaluation-print mx-auto max-w-[1600px] px-3 pb-16 pt-5 sm:px-6">
        <EvaluationSheet fights={fights} onChange={updateFight} identification={form} />
        <section className="mt-6 rounded-2xl border border-line bg-panel p-5"><div className="mb-3 flex items-center gap-2"><ClipboardCheck size={18} className="text-indigo-400" /><label htmlFor="notes" className="text-sm font-bold text-white">Observações rápidas</label></div><textarea id="notes" rows={3} value={notes} onChange={event => setSession(prev => ({ ...prev, notes: event.target.value }))} placeholder="Ex.: Luta 03, revisão do CARE System no minuto 02:40..." className="field min-h-[100px] resize-y" /><p className="mt-2 text-xs text-slate-500">O registro por luta e as anotações são salvos automaticamente neste dispositivo.</p></section>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4"><span className="flex items-center gap-2 text-xs text-slate-400"><MapPin size={15} /> Tatame {form.tatami} {form.event && `· ${form.event}`}</span><div className="flex flex-wrap gap-3"><button type="button" onClick={reset} className="secondary-button">Nova avaliação</button><button type="button" onClick={finish} disabled={!result.complete} className="primary-button disabled:opacity-40">Finalizar avaliação <Flag size={18} /></button></div></div>
        {!result.complete && <p className="mt-3 text-right text-xs text-slate-400">Para finalizar, selecione a função e marque o visto em todos os 20 combates ({result.validated}/20 validados).</p>}
      </main>
    </>}
    {screen === 'finished' && <Report form={form} fights={fights} notes={notes} onResume={() => setSession(prev => ({ ...prev, screen: 'live' }))} onReset={reset} />}
  </div>;
}
