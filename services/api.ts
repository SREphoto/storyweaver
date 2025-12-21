const API_URL = '/api';

// Simple mock database using localStorage for GitHub Pages deployment
const mockDB = {
    getUsers() {
        return JSON.parse(localStorage.getItem('sw_users') || '[]');
    },
    saveUsers(users: any[]) {
        localStorage.setItem('sw_users', JSON.stringify(users));
    },
    getStories() {
        return JSON.parse(localStorage.getItem('sw_stories') || '[]');
    },
    saveStories(stories: any[]) {
        localStorage.setItem('sw_stories', JSON.stringify(stories));
    }
};

const isStatic = window.location.hostname.includes('github.io') || window.location.hostname.includes('vercel.app');

export const api = {
    async request(endpoint: string, options: RequestInit = {}) {
        if (isStatic) {
            return this.handleMockRequest(endpoint, options);
        }

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

    async handleMockRequest(endpoint: string, options: RequestInit) {
        console.log(`[Mock API] ${options.method || 'GET'} ${endpoint}`);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network lag

        if (endpoint === '/auth/login' && options.method === 'POST') {
            const { username, password } = JSON.parse(options.body as string);
            const users = mockDB.getUsers();
            const user = users.find((u: any) => u.username === username);
            if (user && user.password === password) { // In mock mode, we store plain text for simplicity or simplicity
                const token = 'mock-jwt-token-' + Math.random();
                return { token, user: { id: user.id, username: user.username } };
            }
            throw new Error('Invalid credentials');
        }

        if (endpoint === '/auth/register' && options.method === 'POST') {
            const { username, password } = JSON.parse(options.body as string);
            const users = mockDB.getUsers();
            if (users.find((u: any) => u.username === username)) {
                throw new Error('Username already taken');
            }
            const newUser = { id: Math.random().toString(36).substr(2, 9), username, password };
            users.push(newUser);
            mockDB.saveUsers(users);
            const token = 'mock-jwt-token-' + Math.random();
            return { token, user: { id: newUser.id, username: newUser.username } };
        }

        if (endpoint === '/stories' && options.method === 'GET') {
            const stories = mockDB.getStories();
            // Filter by user if possible (we'd need to decode token, but mock is simple)
            return stories;
        }

        if (endpoint === '/stories' && options.method === 'POST') {
            const storyData = JSON.parse(options.body as string);
            const stories = mockDB.getStories();
            const newStory = {
                ...storyData,
                id: Math.random().toString(36).substr(2, 9),
                lastUpdated: new Date().toISOString()
            };
            stories.push(newStory);
            mockDB.saveStories(stories);
            return newStory;
        }

        if (endpoint.startsWith('/stories/') && options.method === 'GET') {
            const id = endpoint.split('/').pop();
            const stories = mockDB.getStories();
            const story = stories.find((s: any) => s.id === id);
            if (story) return story;
            throw new Error('Story not found');
        }

        if (endpoint.startsWith('/stories/') && options.method === 'PUT') {
            const id = endpoint.split('/').pop();
            const storyUpdate = JSON.parse(options.body as string);
            let stories = mockDB.getStories();
            let storyIndex = stories.findIndex((s: any) => s.id === id);
            if (storyIndex !== -1) {
                stories[storyIndex] = { ...stories[storyIndex], ...storyUpdate, lastUpdated: new Date().toISOString() };
                mockDB.saveStories(stories);
                return stories[storyIndex];
            }
            throw new Error('Story not found');
        }

        return { message: 'Mock response success' };
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
