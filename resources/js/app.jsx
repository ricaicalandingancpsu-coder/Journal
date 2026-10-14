import '../css/app.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { PageLoader } from './components/ui';
import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';
import Home from './pages/Home';
import { Contact, NotFound, Privacy } from './pages/Static';
import { Login, Register } from './pages/Auth';
import { ForgotPassword, ResetPassword } from './pages/Recovery';
import Overview from './pages/Overview';
import Journal from './pages/Journal';
import EntryEditor from './pages/EntryEditor';
import EntryDetail from './pages/EntryDetail';
import Calendar from './pages/Calendar';
import Memories from './pages/Memories';
import Settings from './pages/Settings';

function RequireAuth() {
    const { user, loading } = useAuth();
    const location = useLocation();
    if (loading) return <PageLoader />;
    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
    return <Outlet />;
}

function GuestOnly() {
    const { user, loading } = useAuth();
    if (loading) return <PageLoader />;
    if (user) return <Navigate to="/app" replace />;
    return <Outlet />;
}

function App() {
    return (
        <Routes>
            <Route element={<PublicLayout />}>
                <Route index element={<Home />} />
                <Route path="privacy" element={<Privacy />} />
                <Route path="contact" element={<Contact />} />
            </Route>

            <Route element={<GuestOnly />}>
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="reset-password/:token" element={<ResetPassword />} />
            </Route>

            <Route path="app" element={<RequireAuth />}>
                <Route element={<AppLayout />}>
                    <Route index element={<Overview />} />
                    <Route path="journal" element={<Journal />} />
                    <Route path="journal/new" element={<EntryEditor />} />
                    <Route path="journal/:id" element={<EntryDetail />} />
                    <Route path="journal/:id/edit" element={<EntryEditor />} />
                    <Route path="calendar" element={<Calendar />} />
                    <Route path="memories" element={<Memories />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
            </Route>

            <Route element={<PublicLayout />}>
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <ToastProvider>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </ToastProvider>
        </BrowserRouter>
    </StrictMode>,
);
