import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import { Button, Field, FormAlert } from '../components/ui';
import api, { ensureCsrf, errorMessage, fieldErrors } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { usePageTitle } from '../lib/usePageTitle';

export function ForgotPassword() {
    usePageTitle('Forgot password');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [sent, setSent] = useState('');
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        try {
            await ensureCsrf();
            const res = await api.post('/forgot-password', { email });
            setSent(res.data.message);
        } catch (err) {
            setError(fieldErrors(err).email ?? errorMessage(err));
        } finally {
            setBusy(false);
        }
    };

    return (
        <AuthLayout
            title="Reset your password"
            subtitle="Enter your email and we will send you a link to choose a new one."
            footer={<Link to="/login" className="font-semibold text-rose-deep hover:underline">Back to log in</Link>}
        >
            {sent ? (
                <div role="status" className="card flex gap-3 p-5">
                    <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-rose-deep" aria-hidden />
                    <p className="text-sm">{sent}</p>
                </div>
            ) : (
                <form onSubmit={submit} className="space-y-5" noValidate>
                    <FormAlert>{error}</FormAlert>
                    <Field label="Email">
                        {(p) => <input {...p} type="email" required autoFocus autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />}
                    </Field>
                    <Button type="submit" loading={busy} className="w-full !py-3">Send reset link</Button>
                </form>
            )}
        </AuthLayout>
    );
}

export function ResetPassword() {
    usePageTitle('Choose a new password');
    const { token } = useParams();
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [form, setForm] = useState({ email: params.get('email') ?? '', password: '', password_confirmation: '' });
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
            await ensureCsrf();
            const res = await api.post('/reset-password', { ...form, token });
            toast.success(res.data.message);
            navigate('/login', { replace: true });
        } catch (err) {
            const fe = fieldErrors(err);
            setErrors(fe);
            if (!Object.keys(fe).length) setAlert(errorMessage(err));
        } finally {
            setBusy(false);
        }
    };

    return (
        <AuthLayout title="Choose a new password" subtitle="Make it something only you would know.">
            <form onSubmit={submit} className="space-y-5" noValidate>
                <FormAlert>{alert}</FormAlert>
                <Field label="Email" error={errors.email}>
                    {(p) => <input {...p} type="email" required autoComplete="email" className="input" value={form.email} onChange={set('email')} />}
                </Field>
                <Field label="New password" error={errors.password} hint="At least 8 characters.">
                    {(p) => <input {...p} type="password" required autoFocus autoComplete="new-password" className="input" value={form.password} onChange={set('password')} />}
                </Field>
                <Field label="Confirm new password" error={errors.password_confirmation}>
                    {(p) => <input {...p} type="password" required autoComplete="new-password" className="input" value={form.password_confirmation} onChange={set('password_confirmation')} />}
                </Field>
                <Button type="submit" loading={busy} className="w-full !py-3">Reset password</Button>
            </form>
        </AuthLayout>
    );
}
