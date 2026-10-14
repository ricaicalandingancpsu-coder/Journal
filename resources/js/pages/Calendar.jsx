import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, PenLine } from 'lucide-react';
import { useApi } from '../lib/useApi';
import { formatDate, monthKey, toDateString, todayString } from '../lib/dates';
import { moodByKey } from '../lib/moods';
import { usePageTitle } from '../lib/usePageTitle';
import { Button, ButtonLink, ErrorState, PageHeader } from '../components/ui';
import { MoodBadge } from '../components/Mood';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar() {
    usePageTitle('Calendar');
    const today = todayString();
    const [cursor, setCursor] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [selected, setSelected] = useState(today);

    const month = monthKey(cursor);
    const { data, loading, error, reload } = useApi('/calendar', { month });

    const byDate = useMemo(() => {
        const map = {};
        (data?.data ?? []).forEach((e) => (map[e.entry_date] ??= []).push(e));
        return map;
    }, [data]);

    const cells = useMemo(() => {
        const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
        const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
        return [
            ...Array.from({ length: first.getDay() }, () => null),
            ...Array.from({ length: days }, (_, i) => toDateString(new Date(cursor.getFullYear(), cursor.getMonth(), i + 1))),
        ];
    }, [cursor]);

    const shift = (delta) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));
    const selectedEntries = byDate[selected] ?? [];

    return (
        <>
            <PageHeader eyebrow="Browse by day" title="Calendar" />

            <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
                <section className="card p-4 sm:p-6" aria-label="Month view">
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-2xl">{cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" className="!p-2" onClick={() => shift(-1)} aria-label="Previous month"><ChevronLeft className="h-5 w-5" /></Button>
                            <Button
                                variant="secondary"
                                className="!px-3 !py-1.5"
                                onClick={() => { setCursor(new Date(new Date().getFullYear(), new Date().getMonth(), 1)); setSelected(today); }}
                            >
                                Today
                            </Button>
                            <Button variant="ghost" className="!p-2" onClick={() => shift(1)} aria-label="Next month"><ChevronRight className="h-5 w-5" /></Button>
                        </div>
                    </div>

                    {error ? (
                        <ErrorState message={error} onRetry={reload} />
                    ) : (
                        <div className={loading ? 'opacity-60 transition' : 'transition'}>
                            <div className="mb-2 grid grid-cols-7 text-center text-xs font-semibold uppercase tracking-wide text-ink-soft">
                                {WEEKDAYS.map((d) => <div key={d}>{d}</div>)}
                            </div>
                            <div className="grid grid-cols-7 gap-1.5">
                                {cells.map((date, i) => {
                                    if (!date) return <div key={`blank-${i}`} />;
                                    const items = byDate[date] ?? [];
                                    const isSelected = date === selected;
                                    const isToday = date === today;
                                    return (
                                        <button
                                            key={date}
                                            type="button"
                                            onClick={() => setSelected(date)}
                                            aria-pressed={isSelected}
                                            aria-label={`${formatDate(date, { weekday: 'long', month: 'long', day: 'numeric' })}, ${items.length} ${items.length === 1 ? 'entry' : 'entries'}`}
                                            className={`flex aspect-square flex-col items-center justify-between rounded-xl border p-1.5 text-sm transition sm:p-2 ${
                                                isSelected
                                                    ? 'border-rose-deep bg-blush'
                                                    : 'border-transparent hover:border-line hover:bg-blush/40'
                                            }`}
                                        >
                                            <span className={`flex h-6 w-6 items-center justify-center rounded-full ${isToday ? 'bg-rose-deep font-semibold text-onrose' : ''}`}>
                                                {Number(date.slice(8))}
                                            </span>
                                            <span className="flex h-2 items-center gap-0.5">
                                                {items.slice(0, 3).map((e) => (
                                                    <span key={e.id} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: moodByKey[e.mood]?.color ?? 'rgb(var(--ink-soft))' }} />
                                                ))}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </section>

                <section aria-live="polite" aria-label="Selected day">
                    <p className="font-script text-2xl text-rose-deep">
                        {formatDate(selected, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                    <h2 className="mb-5 mt-1 text-2xl">
                        {selectedEntries.length === 0 ? 'No entries' : `${selectedEntries.length} ${selectedEntries.length === 1 ? 'entry' : 'entries'}`}
                    </h2>

                    {selectedEntries.length === 0 ? (
                        <div className="card p-6 text-sm text-ink-soft">
                            <p>Nothing written for this day yet.</p>
                            <ButtonLink to={`/app/journal/new?date=${selected}`} className="mt-5">
                                <PenLine className="h-4 w-4" aria-hidden /> Write for this day
                            </ButtonLink>
                        </div>
                    ) : (
                        <>
                            <ul className="space-y-3">
                                {selectedEntries.map((e) => (
                                    <li key={e.id}>
                                        <Link to={`/app/journal/${e.id}`} className="card block p-4 transition hover:-translate-y-0.5 hover:shadow-lift">
                                            <h3 className="text-lg">{e.title}</h3>
                                            <MoodBadge mood={e.mood} className="mt-2" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <Link to={`/app/journal/new?date=${selected}`} className="btn btn-secondary mt-4">
                                <PenLine className="h-4 w-4" aria-hidden /> Add another
                            </Link>
                        </>
                    )}
                </section>
            </div>
        </>
    );
}
