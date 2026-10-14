import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, LogOut } from 'lucide-react';
import api, { errorMessage, fieldErrors } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usePageTitle } from '../lib/usePageTitle';
import { Button, Field, FormAlert, PageHeader } from '../components/ui';

const THEMES = [
    { key: 'cream', label: 'Cream', swatch: ['#FAF5ED', '#BE8088'] },
    { key: 'blush', label: 'Blush', swatch: ['#FCF0EE', '#BE8088'] },
    { key: 'lavender', label: 'Lavender', swatch: ['#F5F2F9', '#70608E'] },
    { key: 'night', label: 'Night', swatch: ['#221C1E', '#E2A6AF'] },
];

function Section({ title, description, children }) {
    return (
        <section className="grid gap-6 border-b border-line py-8 first:pt-0 last:border-0 md:grid-cols-[240px_1fr]">
            <div>
                <h2 className="text-xl">{title}</h2>
                <p className="mt-1 text-sm text-ink-soft">{description}</p>
            </div>
            <div className="max-w-md">{children}</div>
        </section>
    );
}

function ProfileForm() {
    const { user, setUser } = useAuth();
    const toast = useToast();
    const [form, setForm] = useState({ name: user.name, email: user.email });
    const [errors, setErrors] = useState({});
    const [alert, setAlert] = useState('');
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setErrors({});
        setAlert('');
        try {
            const res = await api.put('/profile', form);
            setUser(res.data.data);
            toast.success('Profile updated.');
        } catch (err) {
            const fe = fieldErrors(err);
            setErrors(fe);
            if (!Object.keys(fe).length) setAlert(errorMessage(err));
        } finally {
            setBusy(false);
        }
    };

    return (
        <form onSubmit={submit} noValidate className="space-y-5">
            <FormAlert>{alert}</FormAlert>
            <Field label="Name" error={errors.name}>
                {(p) => <input {...p} required autoComplete="name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}
            </Field>
            <Field label="Email" error={errors.email}>
                {(p) => <input {...p} type="email" required autoComplete="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />}
            </Field>
            <Button type="submit" loading={busy}>Save profile</Button>
        </form>
    );
}

function PasswordForm() {
    const toast = useToast();
    const empty = { current_password: '', password: '', password_confirmation: '' };
    const [form, setForm] = useState(empty);
    const [errors, setErrors] = useState({});
    const [alert, setAlert] = useState('');
    const [busy, setBusy] = useState(false);
    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setErrors({});
        setAlert('');
        try {
            await api.put('/profile/password', form);
            setForm(empty);
            toast.success('Password updated.');
        } catch (err) {
            const fe = fieldErrors(err);
            setErrors(fe);
            if (!Object.keys(fe).length) setAlert(errorMessage(err));
        } finally {
            setBusy(false);
        }
    };

    return (
        <form onSubmit={submit} noValidate className="space-y-5">
            <FormAlert>{alert}</FormAlert>
            <Field label="Current password" error={errors.current_password}>
                {(p) => <input {...p} type="password" autoComplete="current-password" className="input" value={form.current_password} onChange={set('current_password')} />}
            </Field>
            <Field label="New password" error={errors.password} hint="At least 8 characters.">
                {(p) => <input {...p} type="password" autoComplete="new-password" className="input" value={form.password} onChange={set('password')} />}
            </Field>
            <Field label="Confirm new password" error={errors.password_confirmation}>
                {(p) => <input {...p} type="password" autoComplete="new-password" className="input" value={form.password_confirmation} onChange={set('password_confirmation')} />}
            </Field>
            <Button type="submit" loading={busy}>Update password</Button>
        </form>
    );
}

function Appearance() {
    const { user, setUser } = useAuth();
    const toast = useToast();
    const [busy, setBusy] = useState(false);

    const save = async (changes) => {
        const previous = user;
        setUser({ ...user, ...changes });
        setBusy(true);
        try {
            const res = await api.put('/profile/preferences', { theme: user.theme, text_size: user.text_size, ...changes });
            setUser(res.data.data);
        } catch (err) {
            setUser(previous);
            toast.error(errorMessage(err, 'We could not save that preference.'));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="space-y-6" aria-busy={busy}>
            <fieldset>
                <legend className="mb-3 text-sm font-medium">Theme</legend>
                <div className="grid grid-cols-2 gap-3">
                    {THEMES.map((t) => {
                        const active = user.theme === t.key;
                        return (
                            <label
                                key={t.key}
                                className={`relative flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition focus-within:ring-2 focus-within:ring-rose-deep ${active ? 'border-rose-deep bg-blush/50' : 'border-line hover:border-rose'}`}
                            >
                                <input type="radio" name="theme" value={t.key} checked={active} onChange={() => save({ theme: t.key })} className="sr-only" />
                                <span className="flex h-8 w-8 overflow-hidden rounded-full border border-line">
                                    <span className="h-full w-1/2" style={{ background: t.swatch[0] }} />
                                    <span className="h-full w-1/2" style={{ background: t.swatch[1] }} />
                                </span>
                                <span className="text-sm font-medium">{t.label}</span>
                                {active && <Check className="absolute right-3 h-4 w-4 text-rose-deep" aria-hidden />}
                            </label>
                        );
                    })}
                </div>
            </fieldset>

            <fieldset>
                <legend className="mb-3 text-sm font-medium">Text size</legend>
                <div className="flex gap-3">
                    {[['comfortable', 'Comfortable'], ['large', 'Large']].map(([key, label]) => (
                        <label key={key} className={`flex-1 cursor-pointer rounded-xl border p-3 text-center text-sm font-medium transition focus-within:ring-2 focus-within:ring-rose-deep ${user.text_size === key ? 'border-rose-deep bg-blush/50' : 'border-line hover:border-rose'}`}>
                            <input type="radio" name="text_size" value={key} checked={user.text_size === key} onChange={() => save({ text_size: key })} className="sr-only" />
                            {label}
                        </label>
                    ))}
                </div>
            </fieldset>
        </div>
    );
}

export default function Settings() {
    usePageTitle('Settings');
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [busy, setBusy] = useState(false);

    const handleLogout = async () => {
        setBusy(true);
        await logout();
        navigate('/', { replace: true });
    };

    return (
        <>
            <PageHeader eyebrow="Your account" title="Settings" />
            <div className="mb-8 flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-lavender font-display text-2xl text-lavender-deep">
                    {user.name.trim().charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                    <p className="truncate text-lg font-semibold">{user.name}</p>
                    <p className="truncate text-sm text-ink-soft">{user.email}</p>
                </div>
            </div>
            <Section title="Profile" description="Your name and the email you log in with."><ProfileForm /></Section>
            <Section title="Password" description="Use a long password you do not use anywhere else."><PasswordForm /></Section>
            <Section title="Appearance" description="Choose the paper and text size that feel best. Saved to your account."><Appearance /></Section>
            <Section title="Session" description="Sign out of Dear Diary on this device.">
                <Button variant="secondary" loading={busy} onClick={handleLogout}>
                    <LogOut className="h-4 w-4" aria-hidden /> Log out
                </Button>
            </Section>
        </>
    );
}

