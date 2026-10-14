import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ImagePlus, Lock, Trash2 } from 'lucide-react';
import api, { errorMessage, fieldErrors, toFormData } from '../lib/api';
import { useApi } from '../lib/useApi';
import { todayString } from '../lib/dates';
import { usePageTitle } from '../lib/usePageTitle';
import { useToast } from '../context/ToastContext';
import { Button, ErrorState, Field, FormAlert, PageHeader, PageLoader } from '../components/ui';
import { MoodPicker } from '../components/Mood';
import TagInput from '../components/TagInput';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function EntryEditor() {
    const { id } = useParams();
    const editing = Boolean(id);
    usePageTitle(editing ? 'Edit entry' : 'New entry');

    const [query] = useSearchParams();
    const navigate = useNavigate();
    const toast = useToast();
    const fileInput = useRef(null);

    const existing = useApi(editing ? `/entries/${id}` : null);
    const tagList = useApi('/tags');

    const [form, setForm] = useState({
        title: '',
        content: '',
        entry_date: query.get('date') || todayString(),
        mood: '',
        tags: [],
    });
    const [cover, setCover] = useState(null);
    const [removeCover, setRemoveCover] = useState(false);
    const [errors, setErrors] = useState({});
    const [alert, setAlert] = useState('');
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        const e = existing.data?.data;
        if (!e) return;
        setForm({ title: e.title, content: e.content, entry_date: e.entry_date, mood: e.mood ?? '', tags: e.tags ?? [] });
    }, [existing.data]);

    const preview = useMemo(() => (cover ? URL.createObjectURL(cover) : null), [cover]);
    useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

    const savedCover = existing.data?.data?.cover_url;
    const shownCover = preview ?? (removeCover ? null : savedCover);

    const pickFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!IMAGE_TYPES.includes(file.type)) {
            setErrors((prev) => ({ ...prev, cover: 'Please choose a JPG, PNG, WebP or GIF image.' }));
        } else if (file.size > MAX_IMAGE_BYTES) {
            setErrors((prev) => ({ ...prev, cover: 'That image is larger than 5 MB.' }));
        } else {
            setErrors((prev) => ({ ...prev, cover: undefined }));
            setCover(file);
            setRemoveCover(false);
        }
        e.target.value = '';
    };

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setErrors({});
        setAlert('');
        const payload = {
            ...form,
            mood: form.mood || undefined,
            cover: cover ?? undefined,
            remove_cover: removeCover && !cover ? true : undefined,
        };
        try {
            const res = editing
                ? await api.post(`/entries/${id}`, toFormData(payload, 'PUT'))
                : await api.post('/entries', toFormData(payload));
            toast.success(editing ? 'Entry updated.' : 'Entry saved to your journal.');
            navigate(`/app/journal/${res.data.data.id}`, { replace: true });
        } catch (err) {
            const fe = fieldErrors(err);
            const tagError = Object.entries(fe).find(([k]) => k.startsWith('tags'))?.[1];
            setErrors({ ...fe, tags: tagError });
            if (!Object.keys(fe).length) setAlert(errorMessage(err));
        } finally {
            setBusy(false);
        }
    };

    if (editing && existing.loading) return <PageLoader />;
    if (editing && existing.error) return <ErrorState message="We could not find that entry." onRetry={existing.reload} />;

    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    return (
        <>
            <PageHeader eyebrow={editing ? 'Editing' : 'A new page'} title={editing ? 'Edit entry' : 'Write an entry'} />

            <form onSubmit={submit} noValidate className="grid gap-8 lg:grid-cols-[1fr_300px]">
                <div className="space-y-6">
                    <FormAlert>{alert}</FormAlert>

                    <Field label="Title" error={errors.title}>
                        {(p) => (
                            <input {...p} maxLength={150} required autoFocus placeholder="What is today about?"
                                className="input font-display text-xl" value={form.title} onChange={set('title')} />
                        )}
                    </Field>

                    <Field label="Your entry" error={errors.content}>
                        {(p) => (
                            <textarea {...p} required rows={14} maxLength={50000}
                                placeholder="Dear Diary..."
                                className="input ruled min-h-[22rem] resize-y !bg-card !py-0 !pt-0.5 leading-8"
                                value={form.content} onChange={set('content')} />
                        )}
                    </Field>
                </div>

                <aside className="space-y-6">
                    <div className="card space-y-5 p-5">
                        <Field label="Date" error={errors.entry_date}>
                            {(p) => <input {...p} type="date" required className="input" value={form.entry_date} onChange={set('entry_date')} />}
                        </Field>

                        <div>
                            <p className="mb-1.5 text-sm font-medium">Mood <span className="font-normal text-ink-soft">(optional)</span></p>
                            <MoodPicker value={form.mood} onChange={(mood) => setForm({ ...form, mood })} />
                            {errors.mood && <p className="mt-1.5 text-sm text-red-700" role="alert">{errors.mood}</p>}
                        </div>

                        <div>
                            <p className="mb-1.5 text-sm font-medium">Tags <span className="font-normal text-ink-soft">(optional)</span></p>
                            <TagInput
                                value={form.tags}
                                onChange={(tags) => setForm({ ...form, tags })}
                                suggestions={(tagList.data?.data ?? []).map((t) => t.name)}
                            />
                            {errors.tags && <p className="mt-1.5 text-sm text-red-700" role="alert">{errors.tags}</p>}
                        </div>
                    </div>

                    <div className="card p-5">
                        <p className="mb-3 text-sm font-medium">Cover image <span className="font-normal text-ink-soft">(optional)</span></p>
                        {shownCover ? (
                            <div className="relative">
                                <img src={shownCover} alt="Cover preview" className="h-40 w-full rounded-xl object-cover" />
                                <button
                                    type="button"
                                    onClick={() => { setCover(null); setRemoveCover(true); }}
                                    className="btn btn-secondary absolute right-2 top-2 !p-2"
                                    aria-label="Remove cover image"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInput.current?.click()}
                                className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-rose text-sm text-ink-soft hover:bg-blush/40"
                            >
                                <ImagePlus className="h-5 w-5" aria-hidden /> Add a cover photo
                            </button>
                        )}
                        <input ref={fileInput} type="file" accept={IMAGE_TYPES.join(',')} className="sr-only" onChange={pickFile} aria-label="Cover image file" />
                        {shownCover && (
                            <button type="button" className="mt-3 text-sm font-semibold text-rose-deep hover:underline" onClick={() => fileInput.current?.click()}>
                                Choose a different image
                            </button>
                        )}
                        <p className="mt-2 text-xs text-ink-soft">JPG, PNG, WebP or GIF, up to 5 MB.</p>
                        {errors.cover && <p className="mt-1.5 text-sm text-red-700" role="alert">{errors.cover}</p>}
                    </div>

                    <p className="flex items-center gap-2 text-sm text-ink-soft">
                        <Lock className="h-4 w-4" aria-hidden /> Private. Only you can read this entry.
                    </p>

                    <div className="flex gap-3">
                        <Button type="submit" loading={busy} className="flex-1">{editing ? 'Save changes' : 'Save entry'}</Button>
                        <Link to={editing ? `/app/journal/${id}` : '/app/journal'} className="btn btn-secondary">Cancel</Link>
                    </div>
                </aside>
            </form>
        </>
    );
}
