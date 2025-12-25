import pg from 'pg';
const { Pool } = pg;

interface User {
    id: string;
    username: string;
    passwordHash: string;
}

interface Story {
    id: string;
    userId: string;
    title: string;
    premise: string;
    lastUpdated: string;
    data: any;
}

export interface Data {
    users: User[];
    stories: Story[];
}

// Use PostgreSQL in production, fallback to JSON file in development
const isDevelopment = process.env.NODE_ENV !== 'production';
const usePostgres = !isDevelopment && process.env.DATABASE_URL;

let pool: pg.Pool | null = null;

if (usePostgres) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
}

// JSON file fallback for development
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import fs from 'fs';

const dataDir = path.resolve('data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const defaultData: Data = { users: [], stories: [] };
const adapter = new JSONFile<Data>(path.join(dataDir, 'db.json'));
const jsonDb = new Low<Data>(adapter, defaultData);

export const db = {
    data: defaultData,

    async read() {
        if (usePostgres && pool) {
            // For PostgreSQL, we don't load everything into memory
            console.log('[DB] Using PostgreSQL');
            this.data = { users: [], stories: [] };
        } else {
            console.log('[DB] Using JSON file');
            await jsonDb.read();
            this.data = jsonDb.data || defaultData;
        }
    },

    async write() {
        if (!usePostgres) {
            await jsonDb.write();
        }
        // PostgreSQL writes happen in individual operations
    },

    async getUsers(): Promise<User[]> {
        if (usePostgres && pool) {
            const result = await pool.query('SELECT * FROM users');
            return result.rows;
        }
        return this.data.users;
    },

    async getUserByUsername(username: string): Promise<User | undefined> {
        if (usePostgres && pool) {
            const result = await pool.query(
                'SELECT * FROM users WHERE LOWER(username) = LOWER($1)',
                [username]
            );
            return result.rows[0];
        }
        return this.data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    },

    async addUser(user: User): Promise<void> {
        if (usePostgres && pool) {
            await pool.query(
                'INSERT INTO users (id, username, "passwordHash") VALUES ($1, $2, $3)',
                [user.id, user.username, user.passwordHash]
            );
        } else {
            this.data.users.push(user);
            await this.write();
        }
    },

    async getStoriesByUserId(userId: string): Promise<Story[]> {
        if (usePostgres && pool) {
            const result = await pool.query(
                'SELECT * FROM stories WHERE "userId" = $1 ORDER BY "lastUpdated" DESC',
                [userId]
            );
            return result.rows;
        }
        return this.data.stories.filter(s => s.userId === userId);
    },

    async getStoryById(id: string): Promise<Story | undefined> {
        if (usePostgres && pool) {
            const result = await pool.query('SELECT * FROM stories WHERE id = $1', [id]);
            return result.rows[0];
        }
        return this.data.stories.find(s => s.id === id);
    },

    async addStory(story: Story): Promise<void> {
        if (usePostgres && pool) {
            await pool.query(
                'INSERT INTO stories (id, "userId", title, premise, "lastUpdated", data) VALUES ($1, $2, $3, $4, $5, $6)',
                [story.id, story.userId, story.title, story.premise, story.lastUpdated, JSON.stringify(story.data)]
            );
        } else {
            this.data.stories.push(story);
            await this.write();
        }
    },

    async updateStory(id: string, updates: Partial<Story>): Promise<void> {
        if (usePostgres && pool) {
            const setClause = [];
            const values = [];
            let paramIndex = 1;

            if (updates.title !== undefined) {
                setClause.push(`title = $${paramIndex++}`);
                values.push(updates.title);
            }
            if (updates.premise !== undefined) {
                setClause.push(`premise = $${paramIndex++}`);
                values.push(updates.premise);
            }
            if (updates.lastUpdated !== undefined) {
                setClause.push(`"lastUpdated" = $${paramIndex++}`);
                values.push(updates.lastUpdated);
            }
            if (updates.data !== undefined) {
                setClause.push(`data = $${paramIndex++}`);
                values.push(JSON.stringify(updates.data));
            }

            values.push(id);
            await pool.query(
                `UPDATE stories SET ${setClause.join(', ')} WHERE id = $${paramIndex}`,
                values
            );
        } else {
            const index = this.data.stories.findIndex(s => s.id === id);
            if (index !== -1) {
                this.data.stories[index] = { ...this.data.stories[index], ...updates };
                await this.write();
            }
        }
    },

    async deleteStory(id: string): Promise<void> {
        if (usePostgres && pool) {
            await pool.query('DELETE FROM stories WHERE id = $1', [id]);
        } else {
            this.data.stories = this.data.stories.filter(s => s.id !== id);
            await this.write();
        }
    }
};

export async function initDB() {
    if (usePostgres && pool) {
        console.log('[DB] Initializing PostgreSQL database...');

        // Create tables if they don't exist
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(255) PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                "passwordHash" VARCHAR(255) NOT NULL
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS stories (
                id VARCHAR(255) PRIMARY KEY,
                "userId" VARCHAR(255) NOT NULL,
                title TEXT NOT NULL,
                premise TEXT,
                "lastUpdated" TIMESTAMP NOT NULL,
                data JSONB,
                FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories("userId")
        `);

        console.log('[DB] PostgreSQL tables initialized');
    } else {
        await db.read();
        db.data ||= defaultData;
        await db.write();
        console.log('[DB] JSON file database initialized');
    }
}
