import { useId } from 'react';
import type { ReportForm } from '../data/report';
import type { CompetitionEvent } from '../data/events';

type Props = {
  form: ReportForm;
  events: CompetitionEvent[];
  onSelect: (id: string) => void;
  onNew: () => void;
  onDateChange: (date: string) => void;
  onTatamiChange: (tatami: string) => void;
  light?: boolean;
};

export default function EventFields({ form, events, onSelect, onNew, onDateChange, onTatamiChange, light = false }: Props) {
  const id = useId();
  const hasRegisteredEvent = events.some(event => event.id === form.eventId);
  const selection = hasRegisteredEvent ? form.eventId : form.event ? '__saved__' : '';
  const areaCount = Math.min(200, Math.max(1, form.eventAreas || 12));
  const fieldClass = light ? 'block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800' : 'field';
  return <div className={`grid gap-4 sm:grid-cols-2 ${light ? 'text-slate-700' : 'text-slate-200'}`}>
    <div className="sm:col-span-2">
      <label htmlFor={`${id}-event`} className="mb-2 block text-sm font-semibold">Evento / Competição</label>
      <div className="flex flex-wrap gap-2">
        <select id={`${id}-event`} className={`${fieldClass} min-w-0 flex-1`} value={selection} onChange={event => onSelect(event.target.value)}>
          <option value="">Sem evento selecionado</option>
          {!hasRegisteredEvent && form.event && <option value="__saved__">{form.event} (dados preservados na ficha)</option>}
          {events.map(event => <option key={event.id} value={event.id}>{event.name}</option>)}
        </select>
        <button type="button" className={light ? 'min-h-11 rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-800 hover:bg-indigo-100' : 'secondary-button'} onClick={onNew}>+ Novo</button>
      </div>
      {form.eventLocation && <p className={`mt-2 break-words text-sm ${light ? 'text-slate-600' : 'text-slate-400'}`}><strong>Local:</strong> {form.eventLocation}</p>}
      {form.eventOrganizer && <p className={`mt-1 text-xs ${light ? 'text-slate-500' : 'text-slate-400'}`}>Organização: {form.eventOrganizer} · {form.eventAreas} área(s)</p>}
    </div>
    <label className="space-y-2 text-sm font-semibold"><span>Data da avaliação</span><input type="date" className={fieldClass} value={form.date || ''} onChange={event => onDateChange(event.target.value)} /><span className={`block text-xs font-normal ${light ? 'text-slate-500' : 'text-slate-400'}`}>Ao selecionar um evento, a data inicial é preenchida. Ajuste para o dia avaliado, se necessário.</span></label>
    <label className="space-y-2 text-sm font-semibold"><span>Tatame / Área</span><select className={fieldClass} value={form.tatami} onChange={event => onTatamiChange(event.target.value)}>{Array.from({ length: areaCount }, (_, index) => <option key={index + 1} value={index + 1}>Tatame {index + 1}</option>)}</select></label>
  </div>;
}
