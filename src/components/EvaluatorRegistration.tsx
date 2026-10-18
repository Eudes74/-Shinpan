import { useState, type FormEvent, type ReactNode } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { categories } from '../data/errors';

const storageKey = 'shinpan-avaliador-v1';
const levels = ['Regional', 'Estadual', 'Nacional', ...categories.filter(level => level !== 'Regional' && level !== 'Estadual'), 'FIJ B', 'FIJ A'];
const roles = ['Árbitro(a)', 'Avaliador(a)', 'Supervisor(a) de Área', 'Coordenador(a) de Arbitragem'];
type Evaluator = { name: string; email: string; phone: string; dan: string; federation: string; level: string; role: string };
const empty: Evaluator = { name: '', email: '', phone: '', dan: '', federation: '', level: '', role: '' };
function restore(): Evaluator {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return Object.fromEntries(Object.entries(empty).map(([key, value]) => [key, typeof saved?.[key] === 'string' ? saved[key] : value])) as Evaluator;
  } catch { return empty; }
}
function Field({ label, children, required = false }: { label: string; children: ReactNode; required?: boolean }) {
  return <label className="block space-y-2"><span className="block text-sm font-medium text-slate-100">{label}{required && ' *'}</span>{children}</label>;
}
export default function EvaluatorRegistration({ onSave, onCancel }: { onSave: (name: string, role: string) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Evaluator>(restore);
  const [error, setError] = useState('');
  const update = (key: keyof Evaluator, value: string) => setForm(previous => ({ ...previous, [key]: value }));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const evaluator = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()])) as Evaluator;
    if (!evaluator.name || !evaluator.federation) {
      setError('Preencha o nome e a federação / associação.');
      return;
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(evaluator));
      onSave(evaluator.name, evaluator.role);
    } catch { setError('Não foi possível guardar os dados neste navegador. Verifique se o armazenamento está disponível e tente novamente.'); }
  };
  return <main className="evaluator-registration mx-auto min-h-screen max-w-[950px] px-5 py-8 sm:px-8">
    <button type="button" onClick={onCancel} className="mb-9 inline-flex min-h-10 items-center gap-2 text-sm text-slate-300 hover:text-white"><ArrowLeft size={16} />Voltar ao início</button>
    <header className="mb-9">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-400">Gestão de avaliadores</p>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Cadastrar Avaliador / Responsável</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-400">Registre os dados do responsável técnico que conduzirá as avaliações no tatami.</p>
    </header>
    <form onSubmit={submit} className="rounded border border-slate-700 bg-[#10161c] p-5 sm:p-7">
      <fieldset>
        <legend className="mb-5 text-base font-bold text-white">Dados Pessoais &amp; Contacto</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2"><Field label="Nome Completo" required><input className="field" required autoComplete="name" maxLength={120} value={form.name} onChange={event => update('name', event.target.value)} /></Field></div>
          <Field label="E-mail" required><input className="field" type="email" required autoComplete="email" maxLength={254} value={form.email} onChange={event => update('email', event.target.value)} /></Field>
          <Field label="Telefone / Contacto"><input className="field" type="tel" autoComplete="tel" maxLength={40} value={form.phone} onChange={event => update('phone', event.target.value)} /></Field>
        </div>
      </fieldset>
      <fieldset className="mt-8 border-t border-slate-700 pt-7">
        <legend className="sr-only">Qualificação Técnica &amp; Função</legend>
        <h2 className="mb-5 text-base font-bold text-white" aria-hidden="true">Qualificação Técnica &amp; Função</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Graduação / Dan" required><select className="field" required value={form.dan} onChange={event => update('dan', event.target.value)}><option value="" disabled>Selecione</option>{Array.from({ length: 10 }, (_, index) => <option key={index + 1} value={`${index + 1}º Dan`}>{index + 1}º Dan</option>)}</select></Field>
          <Field label="Federação / Associação" required><input className="field" required maxLength={120} placeholder="Ex: FPJ, CBJ, FIJ" value={form.federation} onChange={event => update('federation', event.target.value)} /></Field>
          <Field label="Nível de Arbitragem" required><select className="field" required value={form.level} onChange={event => update('level', event.target.value)}><option value="" disabled>Selecione</option>{levels.map(level => <option key={level}>{level}</option>)}</select></Field>
          <Field label="Função no Evento" required><select className="field" required value={form.role} onChange={event => update('role', event.target.value)}><option value="" disabled>Selecione</option>{roles.map(role => <option key={role}>{role}</option>)}</select></Field>
        </div>
      </fieldset>
      <p className="mt-6 text-xs leading-relaxed text-slate-400">Os dados deste cadastro ficam salvos somente neste navegador e dispositivo.</p>
      {error && <p role="alert" className="mt-4 text-sm text-rose-300">{error}</p>}
      <footer className="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-700 pt-5">
        <button type="button" onClick={onCancel} className="min-h-11 px-4 text-sm text-slate-200 hover:text-white">Cancelar</button>
        <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400">Guardar Avaliador <Check size={16} /></button>
      </footer>
    </form>
  </main>;
}
