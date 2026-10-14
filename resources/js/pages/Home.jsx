import { PenLine, Sun } from 'lucide-react';
import { Sprig } from '../components/Logo';
import { ButtonLink } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { usePageTitle } from '../lib/usePageTitle';

function HeroVisual() {
    return (
        <div className="relative mx-auto h-[420px] w-full max-w-md sm:h-[460px]" aria-hidden="true">
            <div className="absolute right-0 top-4 h-72 w-72 rounded-full bg-blush sm:h-80 sm:w-80" />
            <div className="absolute -left-2 bottom-6 h-40 w-40 rounded-full bg-lavender" />

            <div className="card absolute left-2 top-6 w-[78%] rotate-[-3deg] p-6 shadow-lift sm:left-0">
                <span className="tape -top-3 left-8 rotate-[-4deg]" />
                <p className="font-script text-xl text-rose-deep">Thursday, 6:40 pm</p>
                <h3 className="mt-1 text-2xl italic">Golden hour</h3>
                <div className="mt-3 space-y-2 border-t border-line pt-3 text-sm leading-relaxed text-ink-soft">
                    <p>Walked the long way home today and the light turned everything honey-coloured.</p>
                    <p>Bought flowers for no reason at all.</p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#7FA6BA2b] px-2.5 py-1 text-xs font-medium">
                        <Sun className="h-3.5 w-3.5 text-[#D9A441]" /> Happy
                    </span>
                    <span className="text-xs text-ink-soft">#walks</span>
                </div>
            </div>

            <div className="card absolute bottom-0 right-0 w-44 rotate-[5deg] p-2.5 pb-4 shadow-lift sm:w-48">
                <span className="tape -top-3 right-6 rotate-[6deg] bg-blush" />
                <svg viewBox="0 0 180 130" className="w-full rounded-lg">
                    <rect width="180" height="130" fill="rgb(var(--lavender))" />
                    <circle cx="128" cy="40" r="20" fill="rgb(var(--blush))" />
                    <path d="M0 100 Q40 62 84 92 T180 78 V130 H0Z" fill="rgb(var(--rose) / 0.55)" />
                    <path d="M0 116 Q50 92 100 112 T180 104 V130 H0Z" fill="rgb(var(--lavender-deep) / 0.55)" />
                </svg>
                <p className="mt-2 text-center font-script text-lg leading-none">sunday by the water</p>
            </div>

            <Sprig className="absolute -right-3 top-0 h-28 w-auto rotate-12 opacity-90 sm:right-4" />
        </div>
    );
}

export default function Home() {
    usePageTitle();
    const { user } = useAuth();

    return (
        <section className="relative overflow-hidden">
                <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pb-28 lg:pt-20">
                    <div>
                        <p className="eyebrow mb-5">A private place to write</p>
                        <h1 className="text-5xl leading-[1.05] sm:text-6xl">
                            A quiet place for the days <em className="text-rose-deep">worth keeping.</em>
                        </h1>
                        <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
                            Dear Diary is a calm, private journal for your everyday moments. Write freely, save
                            the photos that matter and watch the story of your year take shape.
                        </p>
                        <div className="mt-9 flex flex-wrap gap-3">
                            {user ? (
                                <ButtonLink to="/app" className="!px-7 !py-3">Open my diary</ButtonLink>
                            ) : (
                                <>
                                    <ButtonLink to="/register" className="!px-7 !py-3">
                                        <PenLine className="h-4 w-4" aria-hidden /> Start your diary
                                    </ButtonLink>
                                    <ButtonLink to="/login" variant="secondary" className="!px-7 !py-3">Log in</ButtonLink>
                                </>
                            )}
                        </div>
                        <p className="mt-5 text-sm text-ink-soft">Free to use. Your pages stay private.</p>
                    </div>
                    <HeroVisual />
                </div>
            </section>
    );
}
