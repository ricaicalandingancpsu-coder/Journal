import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { CalendarDays, Images, LayoutDashboard, Menu, NotebookText, PenLine, Settings, X } from 'lucide-react';
import Logo from '../components/Logo';

const nav = [
    { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/app/journal', label: 'My Journal', icon: NotebookText },
    { to: '/app/calendar', label: 'Calendar', icon: CalendarDays },
    { to: '/app/memories', label: 'Memories', icon: Images },
    { to: '/app/settings', label: 'Settings', icon: Settings },
];

function SidebarContents({ onNavigate }) {
    return (
        <div className="flex h-full flex-col">
            <div className="px-6 pt-6"><Logo to="/app" /></div>

            <div className="px-4 pt-6">
                <Link to="/app/journal/new" onClick={onNavigate} className="btn btn-primary w-full">
                    <PenLine className="h-4 w-4" aria-hidden /> Write an Entry
                </Link>
            </div>

            <nav aria-label="Dashboard" className="mt-6 flex-1 space-y-1 px-3">
                {nav.map(({ to, label, icon: Icon, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                                isActive ? 'bg-blush text-rose-deep' : 'text-ink-soft hover:bg-blush/50 hover:text-ink'
                            }`
                        }
                    >
                        <Icon className="h-[18px] w-[18px]" aria-hidden />
                        {label}
                    </NavLink>
                ))}
            </nav>

        </div>
    );
}

export default function AppLayout() {
    const [open, setOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setOpen(false);
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return (
        <div className="min-h-screen lg:pl-64">
            <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-2">
                Skip to content
            </a>

            <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-card lg:block">
                <SidebarContents />
            </aside>

            <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-paper/90 px-4 backdrop-blur lg:hidden">
                <Logo to="/app" />
                <button className="btn btn-ghost !p-2" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
                    <Menu className="h-6 w-6" />
                </button>
            </div>

            {open && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} aria-hidden />
                    <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-card shadow-lift" aria-label="Menu">
                        <button className="btn btn-ghost absolute right-3 top-3 !p-2" aria-label="Close menu" onClick={() => setOpen(false)}>
                            <X className="h-5 w-5" />
                        </button>
                        <SidebarContents onNavigate={() => setOpen(false)} />
                    </aside>
                </div>
            )}

            <main id="main" className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-10">
                <Outlet />
            </main>
        </div>
    );
}
