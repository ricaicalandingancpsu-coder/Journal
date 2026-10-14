import { Link } from 'react-router-dom';
import { MoodBadge } from './Mood';
import { formatDate } from '../lib/dates';

export default function EntryCard({ entry }) {
    return (
        <article className="card group relative flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lift">
            {entry.cover_url && (
                <img src={entry.cover_url} alt="" loading="lazy" className="h-40 w-full object-cover" />
            )}
            <div className="flex flex-1 flex-col p-5">
                <p className="font-script text-lg leading-none text-rose-deep">
                    {formatDate(entry.entry_date, { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
                <h3 className="mt-2 text-xl leading-snug">
                    <Link
                        to={`/app/journal/${entry.id}`}
                        className="after:absolute after:inset-0 hover:text-rose-deep"
                    >
                        {entry.title}
                    </Link>
                </h3>
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-soft">{entry.excerpt}</p>
                {(entry.mood || entry.tags?.length > 0) && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <MoodBadge mood={entry.mood} />
                        {entry.tags?.slice(0, 3).map((t) => (
                            <span key={t} className="text-xs text-ink-soft">
                                #{t}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
}
