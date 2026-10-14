import { useId, useState } from 'react';
import { X } from 'lucide-react';

export default function TagInput({ value, onChange, suggestions = [], max = 10 }) {
    const [draft, setDraft] = useState('');
    const listId = useId();

    const add = (raw) => {
        const name = raw.trim().replace(/^#+/, '').slice(0, 40);
        if (!name || value.length >= max) return;
        if (value.some((t) => t.toLowerCase() === name.toLowerCase())) return;
        onChange([...value, name]);
    };

    const commit = () => {
        add(draft);
        setDraft('');
    };

    return (
        <div>
            <div className="input flex flex-wrap items-center gap-2 !py-2">
                {value.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-lavender px-2.5 py-1 text-sm text-ink">
                        #{tag}
                        <button
                            type="button"
                            onClick={() => onChange(value.filter((t) => t !== tag))}
                            aria-label={`Remove tag ${tag}`}
                            className="text-ink-soft hover:text-ink"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </span>
                ))}
                <input
                    value={draft}
                    list={listId}
                    maxLength={40}
                    disabled={value.length >= max}
                    onChange={(e) => setDraft(e.target.value.replace(',', ''))}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            commit();
                        } else if (e.key === 'Backspace' && !draft && value.length) {
                            onChange(value.slice(0, -1));
                        }
                    }}
                    onBlur={commit}
                    placeholder={value.length ? '' : 'Add a tag and press Enter'}
                    aria-label="Add a tag"
                    className="min-w-[8rem] flex-1 border-0 bg-transparent p-0 focus:ring-0"
                />
                <datalist id={listId}>
                    {suggestions.map((s) => (
                        <option key={s} value={s} />
                    ))}
                </datalist>
            </div>
            <p className="mt-1.5 text-xs text-ink-soft">Up to {max} tags. Press Enter or comma to add.</p>
        </div>
    );
}
