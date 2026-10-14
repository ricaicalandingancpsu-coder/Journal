import { useCallback, useEffect, useState } from 'react';
import api, { errorMessage } from './api';

export function useApi(url, params) {
    const [state, setState] = useState({ data: null, loading: Boolean(url), error: null });
    const key = JSON.stringify(params ?? {});

    const load = useCallback(() => {
        if (!url) {
            setState({ data: null, loading: false, error: null });
            return undefined;
        }
        const controller = new AbortController();
        setState((s) => ({ ...s, loading: true, error: null }));
        api.get(url, { params: JSON.parse(key), signal: controller.signal })
            .then((res) => setState({ data: res.data, loading: false, error: null }))
            .catch((err) => {
                if (controller.signal.aborted) return;
                setState({ data: null, loading: false, error: errorMessage(err, 'We could not load this right now.') });
            });
        return () => controller.abort();
    }, [url, key]);

    useEffect(() => load(), [load]);

    return { ...state, reload: load };
}
