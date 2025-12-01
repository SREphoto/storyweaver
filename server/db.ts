import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.resolve('data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

export interface User {
    id: string;
    username: string;
    passwordHash: string;
}

export interface Story {
    id: string;
    userId: string;
    title: string;
    premise: string;
    lastUpdated: string;
    data: any; // The full story export
}

export interface Data {
    users: User[];
    stories: Story[];
}

const defaultData: Data = { users: [], stories: [] };
const adapter = new JSONFile<Data>(path.join(dataDir, 'db.json'));
export const db = new Low<Data>(adapter, defaultData);

export async function initDB() {
    await db.read();
    db.data ||= defaultData;
    await db.write();
}
