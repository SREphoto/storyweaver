import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './db';
import authRoutes from './auth';
import storyRoutes from './stories';
import aiRoutes from './ai';

dotenv.config({ path: '.env.local' });
dotenv.config(); // Also load default .env if needed

const app = express();
const PORT = process.env.PORT || 3005;

console.log("Server starting v1.1.2...");
console.log("API Key present in server process:", !!process.env.GEMINI_API_KEY);
console.log("API Key length:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);

// CORS configuration
const allowedOrigins = [
    'http://localhost:3002',
    'https://srephoto.github.io',
    'https://storyweaver-api.onrender.com'
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(null, true); // Still allow in development, but log it
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Type', 'Authorization']
}));


// Debug logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
    next();
});

// Memory-safe JSON limit for Render Free Tier
app.use(express.json({ limit: '10mb' }));

// Routes
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/ai', aiRoutes);

// Initialize DB and start server
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
});
