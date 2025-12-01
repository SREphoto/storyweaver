const API_URL = '/api';

export const api = {
    async request(endpoint: string, options: RequestInit = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        };

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'An error occurred' }));
            throw new Error(error.error || `Request failed with status ${response.status}`);
        }

        return response.json();
    },

    get(endpoint: string) {
        return this.request(endpoint);
    },

    post(endpoint: string, body: any) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    put(endpoint: string, body: any) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    },

    delete(endpoint: string) {
        return this.request(endpoint, {
            method: 'DELETE',
        });
    }
};
