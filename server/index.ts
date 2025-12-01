import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './db';
import authRoutes from './auth';
import storyRoutes from './stories';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for large story files

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stories', storyRoutes);

// Initialize DB and start server
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
});
