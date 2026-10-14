import { useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, Images, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import api, { errorMessage, fieldErrors, toFormData } from '../lib/api';
import { useApi } from '../lib/useApi';
import { formatDate, todayString } from '../lib/dates';
import { usePageTitle } from '../lib/usePageTitle';
import { useToast } from '../context/ToastContext';
import { Button, ConfirmDialog, EmptyState, ErrorState, Field, FormAlert, Modal, PageHeader, PageLoader } from '../components/ui';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function MemoryForm({ memory, onSaved, onCancel }) {
    const toast = useToast();
    const fileInput = useRef(null);
    const [form, setForm] = useState({
        title: memory?.title ?? '',
        caption: memory?.caption ?? '',
        memory_date: memory?.memory_date ?? todayString(),
    });
    const [file, setFile] = useState(null);
    const [errors, setErrors] = useState({});
    const [alert, setAlert] = useState('');
    const [busy, setBusy] = useState(false);

    const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
    useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);
    const shown = preview ?? memory?.image_url;

    const pick = (e) => {
        const f = e.target.files?.[0];
        e.target.value = '';
        if (!f) return;
        if (!IMAGE_TYPES.includes(f.type)) return setErrors({ image: 'Please choose a JPG, PNG, WebP or GIF image.' });
        if (f.size > MAX_IMAGE_BYTES) return setErrors({ image: 'That image is larger than 5 MB.' });
        setErrors({});
        setFile(f);
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!memory && !file) return setErrors({ image: 'Choose a photo to upload.' });
        setBusy(true);
        setErrors({});
        setAlert('');
        try {
            const payload = { ...form, image: file ?? undefined };
            const res = memory
                ? await api.post(`/memories/${memory.id}`, toFormData(payload, 'PUT'))
                : await api.post('/memories', toFormData(payload));
            toast.success(memory ? 'Memory updated.' : 'Memory saved.');
            onSaved(res.data.data);
        } catch (err) {
            const fe = fieldErrors(err);
            setErrors(fe);
            if (!Object.keys(fe).length) setAlert(errorMessage(err));
        } finally {
            setBusy(false);
        }
    };

    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    return (
        <form onSubmit={submit} noValidate className="space-y-5">
            <FormAlert>{alert}</FormAlert>

            <div>
                {shown ? (
                    <img src={shown} alt="" className="max-h-64 w-full rounded-xl object-cover" />
                ) : (
                    <button
                        type="button"
                        onClick={() => fileInput.current?.click()}
                        className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-rose text-sm text-ink-soft hover:bg-blush/40"
                    >
                        <ImagePlus className="h-5 w-5" aria-hidden /> Choose a photo
                    </button>
                )}
                <input ref={fileInput} type="file" accept={IMAGE_TYPES.join(',')} className="sr-only" onChange={pick} aria-label="Photo file" />
                {shown && (
                    <button type="button" className="mt-2 text-sm font-semibold text-rose-deep hover:underline" onClick={() => fileInput.current?.click()}>
                        {memory ? 'Replace photo' : 'Choose a different photo'}
                    </button>
                )}
                <p className="mt-1.5 text-xs text-ink-soft">JPG, PNG, WebP or GIF, up to 5 MB.</p>
                {errors.image && <p role="alert" className="mt-1.5 text-sm text-red-700">{errors.image}</p>}
            </div>

            <Field label="Title (optional)" error={errors.title}>
                {(p) => <input {...p} maxLength={150} className="input" value={form.title} onChange={set('title')} />}
            </Field>
            <Field label="Caption (optional)" error={errors.caption}>
                {(p) => <textarea {...p} rows={3} maxLength={500} className="input" value={form.caption} onChange={set('caption')} />}
            </Field>
            <Field label="Date" error={errors.memory_date}>
                {(p) => <input {...p} type="date" required className="input" value={form.memory_date} onChange={set('memory_date')} />}
            </Field>

            <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit" loading={busy}>{memory ? 'Save changes' : 'Save memory'}</Button>
            </div>
        </form>
    );
}

export default function Memories() {
    usePageTitle('Memories');
    const toast = useToast();
    const [search, setSearch] = useState('');
    const [q, setQ] = useState('');
    const [page, setPage] = useState(1);
    const [modal, setModal] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [deleteBusy, setDeleteBusy] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => { setQ(search.trim()); setPage(1); }, 350);
        return () => clearTimeout(t);
    }, [search]);

    const { data, loading, error, reload } = useApi('/memories', { q: q || undefined, page: page > 1 ? page : undefined });
    const memories = data?.data ?? [];
    const meta = data?.meta;

    const remove = async () => {
        setDeleteBusy(true);
        try {
            await api.delete(`/memories/${deleting.id}`);
            toast.success('Memory deleted.');
            setDeleting(null);
            if (memories.length === 1 && page > 1) setPage(page - 1);
            else reload();
        } catch (err) {
            toast.error(errorMessage(err, 'We could not delete this memory.'));
        } finally {
            setDeleteBusy(false);
        }
    };

    return (
        <>
            <PageHeader eyebrow="Keepsakes" title="Memories">
                <Button onClick={() => setModal({})}><Plus className="h-4 w-4" aria-hidden /> Add a memory</Button>
            </PageHeader>

            <div className="relative mb-8 max-w-sm">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" aria-hidden />
                <input type="search" aria-label="Search memories" placeholder="Search captions" className="input !pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            {loading ? (
                <PageLoader label="Loading memories" />
            ) : error ? (
                <ErrorState message={error} onRetry={reload} />
            ) : memories.length === 0 ? (
                q ? (
                    <EmptyState icon={Search} title="No memories match">Try a different word.</EmptyState>
                ) : (
                    <EmptyState icon={Images} title="No memories yet" action={<Button onClick={() => setModal({})}>Add your first memory</Button>}>
                        Upload a photo and give it a caption so you remember why it mattered.
                    </EmptyState>
                )
            ) : (
                <>
                    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {memories.map((m) => (
                            <li key={m.id} className="card group relative p-3 pb-5 transition hover:-translate-y-0.5 hover:shadow-lift">
                                <img src={m.image_url} alt={m.caption || m.title || 'Memory photo'} loading="lazy" className="aspect-[4/3] w-full rounded-lg object-cover" />
                                <div className="px-2 pt-4">
                                    {m.title && <h3 className="text-lg leading-snug">{m.title}</h3>}
                                    {m.caption && <p className="mt-1 text-sm text-ink-soft">{m.caption}</p>}
                                    <p className="mt-3 font-script text-lg leading-none text-rose-deep">{formatDate(m.memory_date)}</p>
                                </div>
                                <div className="absolute right-5 top-5 flex gap-1.5">
                                    <button onClick={() => setModal({ memory: m })} aria-label={`Edit memory ${m.title || ''}`.trim()} className="btn btn-secondary !rounded-full !p-2"><Pencil className="h-4 w-4" /></button>
                                    <button onClick={() => setDeleting(m)} aria-label={`Delete memory ${m.title || ''}`.trim()} className="btn btn-secondary !rounded-full !p-2 !text-red-700"><Trash2 className="h-4 w-4" /></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    {meta.last_page > 1 && (
                        <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-4">
                            <Button variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                            <span className="text-sm text-ink-soft">Page {meta.current_page} of {meta.last_page}</span>
                            <Button variant="secondary" disabled={page >= meta.last_page} onClick={() => setPage(page + 1)}>Next</Button>
                        </nav>
                    )}
                </>
            )}

            <Modal open={Boolean(modal)} onClose={() => setModal(null)} title={modal?.memory ? 'Edit memory' : 'Add a memory'}>
                {modal && (
                    <MemoryForm
                        memory={modal.memory}
                        onCancel={() => setModal(null)}
                        onSaved={() => { setModal(null); reload(); }}
                    />
                )}
            </Modal>

            <ConfirmDialog
                open={Boolean(deleting)}
                title="Delete this memory?"
                message="The photo and its caption will be permanently removed."
                loading={deleteBusy}
                onConfirm={remove}
                onClose={() => !deleteBusy && setDeleting(null)}
            />
        </>
    );
}
