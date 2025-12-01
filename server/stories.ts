import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import { authenticateToken } from './auth';

const router = express.Router();

// Get all stories for user
router.get('/', authenticateToken, async (req: any, res) => {
    await db.read();
    const userStories = db.data.stories
        .filter(s => s.userId === req.user.id)
        .map(({ data, ...meta }) => meta); // Return only metadata for list
    res.json(userStories);
});

// Get single story
router.get('/:id', authenticateToken, async (req: any, res) => {
    await db.read();
    const story = db.data.stories.find(s => s.id === req.params.id && s.userId === req.user.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });
    res.json(story);
});

// Create story
router.post('/', authenticateToken, async (req: any, res) => {
    const { title, premise, data } = req.body;
    await db.read();

    const newStory = {
        id: uuidv4(),
        userId: req.user.id,
        title: title || 'Untitled Story',
        premise: premise || '',
        lastUpdated: new Date().toISOString(),
        data: data || {}
    };

    db.data.stories.push(newStory);
    await db.write();
    res.status(201).json(newStory);
});

// Update story
router.put('/:id', authenticateToken, async (req: any, res) => {
    await db.read();
    const storyIndex = db.data.stories.findIndex(s => s.id === req.params.id && s.userId === req.user.id);
    if (storyIndex === -1) return res.status(404).json({ error: 'Story not found' });

    const { title, premise, data } = req.body;
    const updatedStory = {
        ...db.data.stories[storyIndex],
        title: title || db.data.stories[storyIndex].title,
        premise: premise || db.data.stories[storyIndex].premise,
        data: data || db.data.stories[storyIndex].data,
        lastUpdated: new Date().toISOString()
    };

    db.data.stories[storyIndex] = updatedStory;
    await db.write();
    res.json(updatedStory);
});

// Delete story
router.delete('/:id', authenticateToken, async (req: any, res) => {
    await db.read();
    const initialLength = db.data.stories.length;
    db.data.stories = db.data.stories.filter(s => !(s.id === req.params.id && s.userId === req.user.id));

    if (db.data.stories.length === initialLength) {
        return res.status(404).json({ error: 'Story not found' });
    }

    await db.write();
    res.json({ message: 'Story deleted' });
});

export default router;
