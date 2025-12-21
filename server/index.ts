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

const allowedOrigins = [
    'http://localhost:3002',
    'https://srephoto.github.io'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.github.io')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
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
