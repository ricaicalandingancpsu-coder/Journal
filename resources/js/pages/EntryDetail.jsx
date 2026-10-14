import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Lock, Pencil, Trash2 } from 'lucide-react';
import api, { errorMessage } from '../lib/api';
import { useApi } from '../lib/useApi';
import { formatDate } from '../lib/dates';
import { usePageTitle } from '../lib/usePageTitle';
import { useToast } from '../context/ToastContext';
import { Button, ConfirmDialog, EmptyState, ErrorState, PageLoader } from '../components/ui';
import { MoodBadge } from '../components/Mood';

export default function EntryDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const { data, loading, error, reload } = useApi(`/entries/${id}`);
    const [confirming, setConfirming] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const entry = data?.data;
    usePageTitle(entry?.title ?? 'Entry');

    const remove = async () => {
        setDeleting(true);
        try {
            await api.delete(`/entries/${id}`);
            toast.success('Entry deleted.');
            navigate('/app/journal', { replace: true });
        } catch (err) {
            toast.error(errorMessage(err, 'We could not delete this entry.'));
            setDeleting(false);
            setConfirming(false);
        }
    };

    if (loading) return <PageLoader />;
    if (error) {
        return (
            <EmptyState title="Entry not found" action={<Link to="/app/journal" className="btn btn-secondary">Back to journal</Link>}>
                It may have been deleted, or it does not belong to your diary.
            </EmptyState>
        );
    }

    return (
        <article className="mx-auto max-w-2xl">
            <Link to="/app/journal" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
                <ArrowLeft className="h-4 w-4" aria-hidden /> My Journal
            </Link>

            {entry.cover_url && (
                <img src={entry.cover_url} alt="" className="mb-8 max-h-96 w-full rounded-2xl object-cover shadow-soft" />
            )}

            <p className="font-script text-2xl text-rose-deep">
                {formatDate(entry.entry_date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <h1 className="mt-2 text-4xl leading-tight sm:text-5xl">{entry.title}</h1>

            <div className="mt-5 flex flex-wrap items-center gap-3">
                <MoodBadge mood={entry.mood} />
                {entry.tags?.map((t) => (
                    <Link key={t} to={`/app/journal?tag=${encodeURIComponent(t)}`} className="rounded-full bg-lavender px-2.5 py-1 text-xs font-medium hover:brightness-95">
                        #{t}
                    </Link>
                ))}
                <span className="inline-flex items-center gap-1 text-xs text-ink-soft"><Lock className="h-3.5 w-3.5" aria-hidden /> Private</span>
            </div>

            <div className="mt-8 whitespace-pre-wrap break-words text-lg leading-8">{entry.content}</div>

            <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
                <p className="text-xs text-ink-soft">
                    Last edited {new Date(entry.updated_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
                <div className="flex gap-3">
                    <Link to={`/app/journal/${entry.id}/edit`} className="btn btn-secondary"><Pencil className="h-4 w-4" aria-hidden /> Edit</Link>
                    <Button variant="secondary" onClick={() => setConfirming(true)} className="!text-red-700">
                        <Trash2 className="h-4 w-4" aria-hidden /> Delete
                    </Button>
                </div>
            </div>

            <ConfirmDialog
                open={confirming}
                title="Delete this entry?"
                message={`"${entry.title}" and its cover image will be permanently removed. This cannot be undone.`}
                loading={deleting}
                onConfirm={remove}
                onClose={() => !deleting && setConfirming(false)}
            />
        </article>
    );
}
