import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Images, NotebookText, PenLine, CalendarRange } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../lib/useApi';
import { greeting, todayString } from '../lib/dates';
import { moodByKey } from '../lib/moods';
import { usePageTitle } from '../lib/usePageTitle';
import { ButtonLink, EmptyState, ErrorState, PageLoader } from '../components/ui';
import EntryCard from '../components/EntryCard';
import { Sprig } from '../components/Logo';

const prompts = [
    'What made you smile today, even briefly?',
    'Describe a small moment you would like to remember.',
    'What is one thing you are looking forward to?',
    'Who or what are you grateful for right now?',
    'What did you learn about yourself this week?',
    'Write about a place that feels like home.',
];

function Stat({ icon: Icon, label, value, hint }) {
    return (
        <div className="card p-5">
            <div className="flex items-center gap-2 text-sm text-ink-soft">
                <Icon className="h-4 w-4 text-rose-deep" aria-hidden /> {label}
            </div>
            <p className="mt-3 font-display text-4xl">{value}</p>
            {hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
        </div>
    );
}

export default function Overview() {
    usePageTitle('Overview');
    const { user } = useAuth();
    const today = useMemo(todayString, []);
    const { data, loading, error, reload } = useApi('/dashboard', { today });
    const prompt = useMemo(() => prompts[new Date().getDate() % prompts.length], []);

    if (loading) return <PageLoader />;
    if (error) return <ErrorState message={error} onRetry={reload} />;

    const stats = data;
    const topMood = stats.moods[0];
    const maxMood = Math.max(1, ...stats.moods.map((m) => m.count));

    return (
        <>
            <section className="card relative overflow-hidden bg-blush/60 p-7 sm:p-9">
                <Sprig className="pointer-events-none absolute -right-2 -top-2 hidden h-44 w-auto rotate-6 opacity-70 sm:block" />
                <p className="font-script text-2xl text-rose-deep">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                <h1 className="mt-1 text-3xl sm:text-4xl">
                    {greeting()}, {user.name.split(' ')[0]}.
                </h1>
                <p className="mt-3 max-w-md text-ink-soft">
                    {stats.total_entries === 0
                        ? 'Your diary is a blank page. Begin with a sentence, a feeling, anything at all.'
                        : `Today's prompt: ${prompt}`}
                </p>
                <ButtonLink to="/app/journal/new" className="mt-6 !px-6 !py-3">
                    <PenLine className="h-4 w-4" aria-hidden /> Write an Entry
                </ButtonLink>
            </section>

            <section aria-label="Your numbers" className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat icon={NotebookText} label="Total entries" value={stats.total_entries} />
                <Stat icon={CalendarRange} label="This month" value={stats.entries_this_month} />
                <Stat icon={Flame} label="Day streak" value={stats.streak} hint={stats.streak === 1 ? 'day in a row' : 'days in a row'} />
                <Stat icon={Images} label="Memories" value={stats.memories_count} />
            </section>

            <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
                <section aria-labelledby="recent">
                    <div className="mb-4 flex items-baseline justify-between">
                        <h2 id="recent" className="text-2xl">Recent entries</h2>
                        <Link to="/app/journal" className="text-sm font-semibold text-rose-deep hover:underline">View all</Link>
                    </div>
                    {stats.recent_entries.length === 0 ? (
                        <EmptyState icon={NotebookText} title="No entries yet" action={<ButtonLink to="/app/journal/new">Write your first entry</ButtonLink>}>
                            Whatever happened today is worth a few lines.
                        </EmptyState>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {stats.recent_entries.map((e) => <EntryCard key={e.id} entry={e} />)}
                        </div>
                    )}
                </section>

                <section aria-labelledby="moods">
                    <h2 id="moods" className="mb-4 text-2xl">Mood, last 30 days</h2>
                    <div className="card p-5">
                        {stats.moods.length === 0 ? (
                            <p className="text-sm text-ink-soft">Add a mood to your entries and a summary will appear here.</p>
                        ) : (
                            <>
                                <p className="mb-4 text-sm text-ink-soft">
                                    Mostly <strong className="text-ink">{topMood.label.toLowerCase()}</strong> lately.
                                </p>
                                <ul className="space-y-3">
                                    {stats.moods.map((m) => (
                                        <li key={m.mood}>
                                            <div className="mb-1 flex justify-between text-sm">
                                                <span>{m.label}</span>
                                                <span className="text-ink-soft">{m.count}</span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-line">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{ width: `${(m.count / maxMood) * 100}%`, backgroundColor: moodByKey[m.mood]?.color }}
                                                />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}
