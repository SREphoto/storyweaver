import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

const RegisterPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { token, user } = await api.post('/auth/register', { username, password });
            login(token, user);
            navigate('/');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-bg text-brand-text">
            <div className="glass-panel p-8 rounded-2xl w-full max-w-md border border-white/10">
                <h2 className="text-3xl font-serif font-bold mb-6 text-center">Story Weaver</h2>
                <h3 className="text-xl font-bold mb-4 text-center text-brand-secondary">Register</h3>
                {error && <div className="bg-red-500/20 text-red-200 p-3 rounded mb-4 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded p-2 text-white focus:border-brand-primary outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded p-2 text-white focus:border-brand-primary outline-none"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-brand-secondary hover:bg-brand-secondary/80 text-white font-bold py-2 px-4 rounded transition">
                        Register
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-brand-text-muted">
                    Already have an account? <Link to="/login" className="text-brand-primary hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
