import { moodByKey, MOODS } from '../lib/moods';

export function MoodBadge({ mood, className = '' }) {
    const m = moodByKey[mood];
    if (!m) return null;
    const Icon = m.icon;
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
            style={{ backgroundColor: `${m.color}2b`, color: 'rgb(var(--ink))' }}
        >
            <Icon className="h-3.5 w-3.5" style={{ color: m.color }} aria-hidden />
            {m.label}
        </span>
    );
}

export function MoodPicker({ value, onChange }) {
    return (
        <div role="radiogroup" aria-label="Mood" className="flex flex-wrap gap-2">
            {MOODS.map((m) => {
                const selected = value === m.key;
                const Icon = m.icon;
                return (
                    <button
                        key={m.key}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => onChange(selected ? '' : m.key)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
                            selected ? 'border-transparent font-medium' : 'border-line bg-card hover:border-rose'
                        }`}
                        style={selected ? { backgroundColor: `${m.color}38`, boxShadow: `inset 0 0 0 1.5px ${m.color}` } : undefined}
                    >
                        <Icon className="h-4 w-4" style={{ color: m.color }} aria-hidden />
                        {m.label}
                    </button>
                );
            })}
        </div>
    );
}
