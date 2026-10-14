import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { usePageTitle } from '../lib/usePageTitle';

function Shell({ eyebrow, title, children }) {
    return (
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
            <p className="eyebrow mb-3">{eyebrow}</p>
            <h1 className="text-4xl">{title}</h1>
            <div className="mt-8 space-y-5 leading-relaxed text-ink-soft">{children}</div>
        </div>
    );
}

export function Privacy() {
    usePageTitle('Privacy');
    return (
        <Shell eyebrow="Privacy" title="Your diary is yours.">
            <p>Dear Diary is built so that what you write stays between you and your pages.</p>
            <ul className="list-disc space-y-2 pl-5">
                <li>Every entry, photo and tag belongs to your account and can only be opened while you are signed in as you.</li>
                <li>Entries are private by default. There is no public profile and no sharing feed.</li>
                <li>Uploaded images are stored on the server and are only delivered to their owner after a permission check.</li>
                <li>Your password is stored as a one-way hash. We never see or store it in plain text.</li>
                <li>You can edit or delete any entry or memory at any time, and deleting a memory also removes its image file.</li>
            </ul>
            <p>Questions about your data? <Link className="text-rose-deep underline" to="/contact">Get in touch</Link>.</p>
        </Shell>
    );
}

export function Contact() {
    usePageTitle('Contact');
    const email = import.meta.env.VITE_CONTACT_EMAIL || 'hello@example.com';
    return (
        <Shell eyebrow="Contact" title="Say hello.">
            <p>Feedback, a bug, or a question about your account? We would love to hear from you.</p>
            <a href={`mailto:${email}`} className="btn btn-primary">
                <Mail className="h-4 w-4" aria-hidden /> {email}
            </a>
        </Shell>
    );
}

export function NotFound() {
    usePageTitle('Page not found');
    return (
        <Shell eyebrow="404" title="This page wandered off.">
            <p>We could not find what you were looking for.</p>
            <Link to="/" className="btn btn-secondary">Back to home</Link>
        </Shell>
    );
}
