import { Link } from 'react-router-dom';
import Logo, { Sprig } from '../components/Logo';

export default function AuthLayout({ title, subtitle, children, footer }) {
    return (
        <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
            <aside className="relative hidden overflow-hidden bg-blush lg:block">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgb(var(--card)/0.7),transparent_55%)]" />
                <div className="relative flex h-full flex-col justify-between p-12">
                    <Logo />
                    <figure className="max-w-sm">
                        <Sprig className="mb-6 h-32 w-auto opacity-90" />
                        <blockquote className="font-display text-3xl italic leading-snug">
                            &ldquo;Keep a little notebook, and the days will stop slipping away.&rdquo;
                        </blockquote>
                        <figcaption className="mt-4 font-script text-xl text-rose-deep">a note to self</figcaption>
                    </figure>
                    <p className="text-sm text-ink-soft">Your entries are private to you, always.</p>
                </div>
            </aside>

            <main className="flex flex-col px-4 py-8 sm:px-10">
                <div className="lg:hidden"><Logo /></div>
                <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
                    <h1 className="text-4xl">{title}</h1>
                    {subtitle && <p className="mt-3 text-ink-soft">{subtitle}</p>}
                    <div className="mt-8">{children}</div>
                    {footer && <div className="mt-8 text-center text-sm text-ink-soft">{footer}</div>}
                </div>
                <p className="text-center text-xs text-ink-soft">
                    <Link to="/" className="hover:text-ink">&larr; Back to home</Link>
                </p>
            </main>
        </div>
    );
}
