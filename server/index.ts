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

app.use(cors({
    origin: [
        'https://srephoto.github.io',
        'http://localhost:3002',
        'https://srephoto.github.io/storyweaver'
    ],
    credentials: true,
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// Handle preflight requests for all routes
app.options('*', cors());
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
