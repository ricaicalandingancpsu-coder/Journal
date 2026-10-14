import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import { Button, Field, FormAlert } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { errorMessage, fieldErrors } from '../lib/api';
import { usePageTitle } from '../lib/usePageTitle';

export function Login() {
    usePageTitle('Log in');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ email: '', password: '', remember: false });
    const [errors, setErrors] = useState({});
    const [alert, setAlert] = useState('');
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setErrors({});
        setAlert('');
        try {
            await login(form);
            navigate(location.state?.from ?? '/app', { replace: true });
        } catch (err) {
            const fe = fieldErrors(err);
            setErrors(fe);
            if (!Object.keys(fe).length) setAlert(errorMessage(err));
        } finally {
            setBusy(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Pick up where you left off."
            footer={<>New here? <Link to="/register" className="font-semibold text-rose-deep hover:underline">Create a diary</Link></>}
        >
            <form onSubmit={submit} className="space-y-5" noValidate>
                <FormAlert>{alert}</FormAlert>
                <Field label="Email" error={errors.email}>
                    {(p) => (
                        <input {...p} type="email" autoComplete="email" required autoFocus className="input" value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    )}
                </Field>
                <Field label="Password" error={errors.password}>
                    {(p) => (
                        <input {...p} type="password" autoComplete="current-password" required className="input" value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })} />
                    )}
                </Field>
                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded border-line text-rose-deep focus:ring-rose-deep"
                            checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} />
                        Remember me
                    </label>
                    <Link to="/forgot-password" className="text-rose-deep hover:underline">Forgot password?</Link>
                </div>
                <Button type="submit" loading={busy} className="w-full !py-3">Log in</Button>
            </form>
        </AuthLayout>
    );
}

export function Register() {
    usePageTitle('Sign up');
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
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
            await register(form);
            navigate('/app', { replace: true });
        } catch (err) {
            const fe = fieldErrors(err);
            setErrors(fe);
            if (!Object.keys(fe).length) setAlert(errorMessage(err));
        } finally {
            setBusy(false);
        }
    };

    return (
        <AuthLayout
            title="Start your diary"
            subtitle="Create an account and write your first page in a minute."
            footer={<>Already have an account? <Link to="/login" className="font-semibold text-rose-deep hover:underline">Log in</Link></>}
        >
            <form onSubmit={submit} className="space-y-5" noValidate>
                <FormAlert>{alert}</FormAlert>
                <Field label="Your name" error={errors.name}>
                    {(p) => <input {...p} autoComplete="name" required autoFocus className="input" value={form.name} onChange={set('name')} />}
                </Field>
                <Field label="Email" error={errors.email}>
                    {(p) => <input {...p} type="email" autoComplete="email" required className="input" value={form.email} onChange={set('email')} />}
                </Field>
                <Field label="Password" error={errors.password} hint="At least 8 characters.">
                    {(p) => <input {...p} type="password" autoComplete="new-password" required className="input" value={form.password} onChange={set('password')} />}
                </Field>
                <Field label="Confirm password" error={errors.password_confirmation}>
                    {(p) => <input {...p} type="password" autoComplete="new-password" required className="input" value={form.password_confirmation} onChange={set('password_confirmation')} />}
                </Field>
                <Button type="submit" loading={busy} className="w-full !py-3">Create my diary</Button>
            </form>
        </AuthLayout>
    );
}
