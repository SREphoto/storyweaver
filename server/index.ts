import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './db';
import authRoutes from './auth';
import storyRoutes from './stories';

dotenv.config({ path: '.env.local' });
dotenv.config(); // Also load default .env if needed

const app = express();
const PORT = process.env.PORT || 3005;

console.log("Server starting...");
console.log("API Key present in server process:", !!process.env.GEMINI_API_KEY);
console.log("API Key length:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);

// Manual CORS Middleware (more robust for some environments)
app.use((req, res, next) => {
    const origin = req.headers.origin;
    // Allow any origin that ends in github.io or is localhost
    if (origin && (origin.includes('github.io') || origin.includes('localhost'))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (!origin) {
        // Fallback for non-browser requests
        res.setHeader('Access-Control-Allow-Origin', '*');
    }

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    if (req.method === 'OPTIONS') {
        return res.status(200).send();
    }
    next();
});

// Debug logging middleware
app.use((req, res, next) => {
    console.log(`[Request] ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
    next();
});
app.use(express.json({ limit: '50mb' })); // Increase limit for large story files

// Routes
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/stories', storyRoutes);

// Initialize DB and start server
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
});
