import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, NotebookText, PenLine, Search, X } from 'lucide-react';
import { useApi } from '../lib/useApi';
import { MOODS } from '../lib/moods';
import { usePageTitle } from '../lib/usePageTitle';
import { Button, ButtonLink, EmptyState, ErrorState, PageHeader, PageLoader } from '../components/ui';
import EntryCard from '../components/EntryCard';

const SORTS = [
    { value: 'newest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
    { value: 'updated', label: 'Recently edited' },
    { value: 'title', label: 'Title A to Z' },
];

export default function Journal() {
    usePageTitle('My Journal');
    const [params, setParams] = useSearchParams();
    const filters = {
        q: params.get('q') ?? '',
        mood: params.get('mood') ?? '',
        tag: params.get('tag') ?? '',
        from: params.get('from') ?? '',
        to: params.get('to') ?? '',
        sort: params.get('sort') ?? 'newest',
        page: Number(params.get('page') ?? 1),
    };

    const latestParams = useRef(params);
    latestParams.current = params;

    const update = (changes) => {
        const next = new URLSearchParams(latestParams.current);
        Object.entries({ page: '', ...changes }).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
        setParams(next, { replace: true });
    };

    const [search, setSearch] = useState(filters.q);
    useEffect(() => setSearch(filters.q), [filters.q]);
    useEffect(() => {
        if (search === filters.q) return undefined;
        const t = setTimeout(() => update({ q: search.trim() }), 350);
        return () => clearTimeout(t);
    }, [search]);

    const entries = useApi('/entries', { ...filters, page: filters.page > 1 ? filters.page : undefined, sort: filters.sort });
    const tags = useApi('/tags');

    const hasFilters = filters.q || filters.mood || filters.tag || filters.from || filters.to;
    const meta = entries.data?.meta;

    return (
        <>
            <PageHeader eyebrow="Your pages" title="My Journal">
                <ButtonLink to="/app/journal/new"><PenLine className="h-4 w-4" aria-hidden /> Write an Entry</ButtonLink>
            </PageHeader>

            <form role="search" onSubmit={(e) => e.preventDefault()} className="card mb-8 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6">
                <div className="relative sm:col-span-2 lg:col-span-2">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" aria-hidden />
                    <input
                        type="search"
                        aria-label="Search entries"
                        placeholder="Search titles and words"
                        className="input !pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select aria-label="Filter by mood" className="input" value={filters.mood} onChange={(e) => update({ mood: e.target.value })}>
                    <option value="">Any mood</option>
                    {MOODS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
                </select>
                <select aria-label="Filter by tag" className="input" value={filters.tag} onChange={(e) => update({ tag: e.target.value })}>
                    <option value="">Any tag</option>
                    {(tags.data?.data ?? []).map((t) => <option key={t.id} value={t.name}>#{t.name} ({t.entries_count})</option>)}
                </select>
                <select aria-label="Sort entries" className="input" value={filters.sort} onChange={(e) => update({ sort: e.target.value === 'newest' ? '' : e.target.value })}>
                    {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <label className="flex items-center gap-2 text-sm text-ink-soft sm:col-span-1 lg:col-span-1">
                    From
                    <input type="date" className="input !py-2" value={filters.from} max={filters.to || undefined} onChange={(e) => update({ from: e.target.value })} />
                </label>
                <label className="flex items-center gap-2 text-sm text-ink-soft sm:col-span-1 lg:col-span-1">
                    To
                    <input type="date" className="input !py-2" value={filters.to} min={filters.from || undefined} onChange={(e) => update({ to: e.target.value })} />
                </label>
                {hasFilters && (
                    <div className="sm:col-span-2 lg:col-span-6">
                        <Button type="button" variant="ghost" onClick={() => { setSearch(''); setParams({}, { replace: true }); }}>
                            <X className="h-4 w-4" aria-hidden /> Clear filters
                        </Button>
                    </div>
                )}
            </form>

            {entries.loading ? (
                <PageLoader label="Loading entries" />
            ) : entries.error ? (
                <ErrorState message={entries.error} onRetry={entries.reload} />
            ) : entries.data.data.length === 0 ? (
                hasFilters ? (
                    <EmptyState icon={Search} title="Nothing matches those filters">
                        Try a different word, or clear the filters to see everything.
                    </EmptyState>
                ) : (
                    <EmptyState icon={NotebookText} title="Your journal is empty" action={<ButtonLink to="/app/journal/new">Write your first entry</ButtonLink>}>
                        A fresh page is waiting for you.
                    </EmptyState>
                )
            ) : (
                <>
                    <p className="mb-4 text-sm text-ink-soft" aria-live="polite">
                        {meta.total} {meta.total === 1 ? 'entry' : 'entries'}
                    </p>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {entries.data.data.map((e) => <EntryCard key={e.id} entry={e} />)}
                    </div>
                    {meta.last_page > 1 && (
                        <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-4">
                            <Button variant="secondary" disabled={meta.current_page <= 1} onClick={() => update({ page: String(meta.current_page - 1) })}>
                                <ChevronLeft className="h-4 w-4" aria-hidden /> Previous
                            </Button>
                            <span className="text-sm text-ink-soft">Page {meta.current_page} of {meta.last_page}</span>
                            <Button variant="secondary" disabled={meta.current_page >= meta.last_page} onClick={() => update({ page: String(meta.current_page + 1) })}>
                                Next <ChevronRight className="h-4 w-4" aria-hidden />
                            </Button>
                        </nav>
                    )}
                </>
            )}
        </>
    );
}
