import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    withXSRFToken: true,
    headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
});

export const ensureCsrf = () => axios.get('/sanctum/csrf-cookie', { withCredentials: true });

export function fieldErrors(error) {
    const errors = error?.response?.data?.errors ?? {};
    return Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, v[0]]));
}

export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
    if (!error?.response) return 'We could not reach the server. Check your connection and try again.';
    if (error.response.status === 413) return 'That file is too large to upload.';
    if (error.response.status === 429) return 'Too many attempts. Please wait a moment.';
    if (error.response.status >= 500) return fallback;
    return error.response.data?.message ?? fallback;
}

export function toFormData(values, method) {
    const form = new FormData();
    if (method) form.append('_method', method);
    Object.entries(values).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (Array.isArray(value)) value.forEach((v) => form.append(`${key}[]`, v));
        else if (typeof value === 'boolean') form.append(key, value ? '1' : '0');
        else form.append(key, value);
    });
    return form;
}

export default api;
