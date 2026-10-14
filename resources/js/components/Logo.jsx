import { Link } from 'react-router-dom';

export default function Logo({ to = '/', className = '' }) {
    return (
        <Link to={to} className={`inline-flex items-center ${className}`}>
            <span className="font-display text-xl font-medium italic tracking-tight">Dear Diary</span>
        </Link>
    );
}

export function Sprig({ className = '' }) {
    return (
        <svg viewBox="0 0 80 140" className={className} fill="none" aria-hidden="true">
            <path d="M40 138C40 100 36 62 44 8" stroke="rgb(var(--ink-soft))" strokeWidth="1.5" strokeLinecap="round" />
            {[
                [38, 112, -35], [44, 96, 40], [37, 78, -40], [45, 60, 38], [39, 44, -35], [44, 28, 35],
            ].map(([x, y, r], i) => (
                <ellipse
                    key={i}
                    cx={x + (r < 0 ? -9 : 9)}
                    cy={y}
                    rx="11"
                    ry="5"
                    transform={`rotate(${r} ${x + (r < 0 ? -9 : 9)} ${y})`}
                    fill={i % 2 ? 'rgb(var(--lavender))' : 'rgb(var(--blush))'}
                    stroke="rgb(var(--rose))"
                    strokeOpacity="0.5"
                />
            ))}
            <circle cx="44" cy="8" r="5" fill="rgb(var(--rose))" fillOpacity="0.7" />
        </svg>
    );
}
