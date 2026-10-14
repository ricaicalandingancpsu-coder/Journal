import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

const links = [
    { to: '/', label: 'Home', end: true },
];

function useHashScroll() {
    const { pathname, hash } = useLocation();
    useEffect(() => {
        if (hash) {
            requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView());
        } else {
            window.scrollTo(0, 0);
        }
    }, [pathname, hash]);
}

export default function PublicLayout() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const location = useLocation();
    useHashScroll();

    useEffect(() => setOpen(false), [location.pathname, location.hash]);

    return (
        <div className="flex min-h-screen flex-col">
            <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-2">
                Skip to content
            </a>
            <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/90 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                    <Logo />
                    <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
                        {links.map((l) => (
                            <NavLink
                                key={l.label}
                                to={l.to}
                                end={l.end}
                                className={({ isActive }) =>
                                    `rounded-full px-4 py-2 text-sm font-medium hover:bg-blush/60 ${
                                        isActive && !l.to.includes('#') ? 'text-rose-deep' : 'text-ink-soft'
                                    }`
                                }
                            >
                                {l.label}
                            </NavLink>
                        ))}
                    </nav>
                    <div className="hidden items-center gap-2 md:flex">
                        {user ? (
                            <Link to="/app" className="btn btn-primary">Open my diary</Link>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-ghost">Log in</Link>
                                <Link to="/register" className="btn btn-primary">Sign up</Link>
                            </>
                        )}
                    </div>
                    <button
                        className="btn btn-ghost !p-2 md:hidden"
                        aria-label={open ? 'Close menu' : 'Open menu'}
                        aria-expanded={open}
                        aria-controls="mobile-menu"
                        onClick={() => setOpen((o) => !o)}
                    >
                        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
                {open && (
                    <div id="mobile-menu" className="border-t border-line bg-paper px-4 pb-5 pt-2 md:hidden">
                        <nav aria-label="Mobile" className="flex flex-col">
                            {links.map((l) => (
                                <Link key={l.label} to={l.to} className="rounded-lg px-3 py-3 font-medium hover:bg-blush/60">
                                    {l.label}
                                </Link>
                            ))}
                        </nav>
                        <div className="mt-3 flex gap-3">
                            {user ? (
                                <Link to="/app" className="btn btn-primary flex-1">Open my diary</Link>
                            ) : (
                                <>
                                    <Link to="/login" className="btn btn-secondary flex-1">Log in</Link>
                                    <Link to="/register" className="btn btn-primary flex-1">Sign up</Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>

            <main id="main" className="flex-1">
                <Outlet />
            </main>
        </div>
    );
}
