import { useEffect, useRef, useState, type FormEvent } from 'react';
import { CalendarDays, Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { formatEventDate, isEventDate, type CompetitionEvent } from '../data/events';

type Props = {
  events: CompetitionEvent[];
  activeEventId: string;
  createNew: boolean;
  storageError: string;
  onClose: () => void;
  onSave: (event: CompetitionEvent) => boolean;
  onActivate: (event: CompetitionEvent) => boolean;
  onDelete: (id: string) => void;
};
type Draft = Omit<CompetitionEvent, 'id' | 'areas'> & { areas: string };
const empty: Draft = { name: '', location: '', startDate: '', endDate: '', organizer: '', areas: '1' };

export default function EventManager({ events, activeEventId, createNew, storageError, onClose, onSave, onActivate, onDelete }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [editing, setEditing] = useState(createNew || !events.length);
  const [editingId, setEditingId] = useState('');
  const [draft, setDraft] = useState<Draft>(empty);
  const [error, setError] = useState('');
  useEffect(() => {
    const dialog = dialogRef.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog?.showModal();
    return () => { dialog?.close(); document.body.style.overflow = overflow; };
  }, []);
  const update = (key: keyof Draft, value: string) => setDraft(prev => ({ ...prev, [key]: value }));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const areas = Number(draft.areas);
    if (!draft.name.trim() || !draft.location.trim() || !draft.organizer.trim()) {
      setError('Preencha o nome, o local e a entidade organizadora.'); return;
    }
    if (!isEventDate(draft.startDate) || !isEventDate(draft.endDate) || draft.endDate < draft.startDate) {
      setError('Informe datas válidas. O término não pode ser anterior ao início.'); return;
    }
    if (!Number.isInteger(areas) || areas < 1 || areas > 200) {
      setError('Informe uma quantidade de áreas entre 1 e 200.'); return;
    }
    if (onSave({ ...draft, id: editingId || crypto.randomUUID(), name: draft.name.trim(), location: draft.location.trim(), organizer: draft.organizer.trim(), areas })) onClose();
  };
  const newEvent = () => { setDraft(empty); setEditingId(''); setError(''); setEditing(true); };
  return <dialog ref={dialogRef} className="event-manager no-print m-auto max-h-[calc(100dvh-24px)] w-[calc(100%-24px)] max-w-3xl overflow-y-auto rounded-2xl border border-line bg-panel p-0 text-slate-100 shadow-2xl" aria-labelledby="events-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="p-5 sm:p-7">
      <header className="mb-6 flex items-start justify-between gap-3">
        <div><h2 id="events-title" className="flex items-center gap-2 text-xl font-bold"><CalendarDays size={22} className="text-indigo-400" />Eventos / Competições</h2><p className="mt-2 text-sm text-slate-400">Cadastre eventos e escolha o evento ativo para sua avaliação.</p></div>
        <button type="button" className="secondary-button shrink-0 !px-3" aria-label="Fechar eventos" onClick={onClose}><X size={20} /></button>
      </header>
      {!editing ? <>
        <button type="button" className="primary-button mb-5" onClick={newEvent}><Plus size={18} />Novo evento</button>
        <div className="grid gap-3">{events.map(event => <article key={event.id} className={`rounded-xl border p-4 ${event.id === activeEventId ? 'border-indigo-400 bg-indigo-500/10' : 'border-line'}`}>
          <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><h3 className="break-words font-bold text-white">{event.name}</h3><p className="mt-1 break-words text-sm text-slate-300">{event.location}</p><p className="mt-2 text-xs text-slate-400">{formatEventDate(event.startDate)} a {formatEventDate(event.endDate)} · {event.organizer} · {event.areas} área(s)</p></div>{event.id === activeEventId && <span className="flex items-center gap-1 text-xs font-bold text-indigo-300"><Check size={15} />Evento ativo</span>}</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="primary-button" onClick={() => { if (onActivate(event)) onClose(); }}>Usar na ficha</button>
            <button type="button" className="secondary-button" onClick={() => { setDraft({ ...event, areas: String(event.areas) }); setEditingId(event.id); setError(''); setEditing(true); }}><Pencil size={16} />Editar</button>
            <button type="button" className="secondary-button" aria-label={`Excluir ${event.name}`} onClick={() => { if (window.confirm(`Excluir o evento “${event.name}”? Os dados já vinculados à ficha atual serão preservados.`)) onDelete(event.id); }}><Trash2 size={16} />Excluir</button>
          </div>
        </article>)}</div>
        {!events.length && <p className="py-6 text-sm text-slate-400">Nenhum evento cadastrado. Clique em “Novo evento” para começar.</p>}
      </> : <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <h3 className="font-semibold sm:col-span-2">{editingId ? 'Editar evento' : 'Cadastrar evento'}</h3>
        <label className="space-y-2 text-sm font-semibold sm:col-span-2"><span>Nome do Evento / Competição</span><input autoFocus required maxLength={160} className="field" placeholder="Campeonato Paulista de Judô 2026" value={draft.name} onChange={event => update('name', event.target.value)} /></label>
        <label className="space-y-2 text-sm font-semibold sm:col-span-2"><span>Local / Cidade / Ginásio</span><input required maxLength={200} className="field" placeholder="Ginásio Municipal de Esportes - Rio Claro/SP" value={draft.location} onChange={event => update('location', event.target.value)} /></label>
        <label className="space-y-2 text-sm font-semibold"><span>Data de Início</span><input type="date" required className="field" value={draft.startDate} onChange={event => update('startDate', event.target.value)} /></label>
        <label className="space-y-2 text-sm font-semibold"><span>Data de Término</span><input type="date" required min={draft.startDate || undefined} className="field" value={draft.endDate} onChange={event => update('endDate', event.target.value)} /></label>
        <label className="space-y-2 text-sm font-semibold"><span>Entidade Organizadora</span><input required maxLength={120} className="field" placeholder="Ex.: FPJ, CBJ" value={draft.organizer} onChange={event => update('organizer', event.target.value)} /></label>
        <label className="space-y-2 text-sm font-semibold"><span>Quantidade de Áreas / Tatames</span><input type="number" required min={1} max={200} step={1} className="field" value={draft.areas} onChange={event => update('areas', event.target.value)} /></label>
        {error && <p role="alert" className="text-sm text-rose-300 sm:col-span-2">{error}</p>}
        <div className="flex flex-wrap gap-3 sm:col-span-2"><button type="submit" className="primary-button">Salvar e usar evento</button><button type="button" className="secondary-button" onClick={() => { setEditing(false); setError(''); }}>Voltar à lista</button></div>
      </form>}
      {storageError && <p role="alert" className="mt-4 text-sm text-rose-300">{storageError}</p>}
      <p className="mt-6 text-xs leading-relaxed text-slate-500">Os eventos ficam salvos somente neste navegador. Excluir um cadastro preserva os dados da ficha atual. Salvar e usar um evento atualiza os dados desta ficha.</p>
    </div>
  </dialog>;
}
