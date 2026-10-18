import type { ReportForm } from './report';

export type CompetitionEvent = {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  organizer: string;
  areas: number;
};
export type EventStore = { events: CompetitionEvent[]; activeEventId: string };
export const eventStorageKey = 'shinpan-eventos-v1';
export function isEventDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function formatEventDate(value?: string): string {
  return value && isEventDate(value) ? value.split('-').reverse().join('/') : '';
}
export function loadEventStore(): EventStore {
  try {
    const saved = JSON.parse(localStorage.getItem(eventStorageKey) || 'null');
    if (!Array.isArray(saved?.events)) return { events: [], activeEventId: '' };
    const events: CompetitionEvent[] = saved.events.filter((item: CompetitionEvent) => item &&
      typeof item.id === 'string' && typeof item.name === 'string' && item.name.trim() &&
      typeof item.location === 'string' && typeof item.organizer === 'string' &&
      typeof item.startDate === 'string' && isEventDate(item.startDate) &&
      typeof item.endDate === 'string' && isEventDate(item.endDate) && item.endDate >= item.startDate &&
      Number.isInteger(item.areas) && item.areas >= 1 && item.areas <= 200);
    return { events, activeEventId: events.some(item => item.id === saved.activeEventId) ? saved.activeEventId : '' };
  } catch { return { events: [], activeEventId: '' }; }
}
export function eventFormFields(event?: CompetitionEvent) {
  return {
    eventId: event?.id || '', event: event?.name || '', eventLocation: event?.location || '',
    eventStartDate: event?.startDate || '', eventEndDate: event?.endDate || '',
    eventOrganizer: event?.organizer || '', eventAreas: event?.areas,
    date: event?.startDate || '',
  };
}
export function applyEvent(form: ReportForm, event?: CompetitionEvent): ReportForm {
  const limit = event?.areas || 12;
  const area = Number(form.tatami);
  return { ...form, ...eventFormFields(event), tatami: Number.isInteger(area) && area >= 1 && area <= limit ? form.tatami : '1' };
}
