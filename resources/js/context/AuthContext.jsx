import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { ensureCsrf } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/user')
            .then((res) => setUser(res.data.data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));

        const id = api.interceptors.response.use(
            (res) => res,
            (error) => {
                const url = error.config?.url ?? '';
                if (error.response?.status === 401 && !['/user', '/login', '/register'].includes(url)) {
                    setUser(null);
                }
                return Promise.reject(error);
            },
        );
        return () => api.interceptors.response.eject(id);
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        root.dataset.theme = user?.theme ?? 'cream';
        root.dataset.text = user?.text_size ?? 'comfortable';
    }, [user?.theme, user?.text_size]);

    const login = useCallback(async (credentials) => {
        await ensureCsrf();
        const res = await api.post('/login', credentials);
        setUser(res.data.data);
    }, []);

    const register = useCallback(async (details) => {
        await ensureCsrf();
        const res = await api.post('/register', details);
        setUser(res.data.data);
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post('/logout');
        } finally {
            setUser(null);
        }
    }, []);

    const value = useMemo(
        () => ({ user, setUser, loading, login, register, logout }),
        [user, loading, login, register, logout],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
