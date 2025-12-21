import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from './db';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-prod';

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        await db.read();
        const existingUser = db.data.users.find(u => u.username === username);
        if (existingUser) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = {
            id: uuidv4(),
            username,
            passwordHash
        };

        db.data.users.push(newUser);
        await db.write();

        const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: newUser.id, username: newUser.username } });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log(`Login attempt for username: '${username}'`);

        await db.read();
        const user = db.data.users.find(u => u.username.toLowerCase() === username.toLowerCase());

        if (!user) {
            console.log(`Login failed: user '${username}' not found.`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log(`User found: ${user.id}`);
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        console.log(`Password match result: ${passwordMatch}`);

        if (!passwordMatch) {
            console.log('Password does not match hash');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, username: user.username } });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Middleware
export const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

export default router;
