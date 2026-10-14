const pad = (n) => String(n).padStart(2, '0');

export const toDateString = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayString = () => toDateString(new Date());
export const monthKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;

export function parseDate(value) {
    const [y, m, d] = String(value).slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d);
}

export function formatDate(value, options = { month: 'long', day: 'numeric', year: 'numeric' }) {
    return parseDate(value).toLocaleDateString(undefined, options);
}

export function greeting(date = new Date()) {
    const hour = date.getHours();
    if (hour < 5) return 'Still up';
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
}
