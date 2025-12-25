import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import { authenticateToken } from './auth';

const router = express.Router();

// Get all stories for user
router.get('/', authenticateToken, async (req: any, res) => {
    try {
        const userStories = await db.getStoriesByUserId(req.user.id);
        const metadata = userStories.map(({ data, ...meta }) => meta); // Return only metadata for list
        res.json(metadata);
    } catch (error) {
        console.error('[Stories] Error fetching stories:', error);
        res.status(500).json({ error: 'Failed to fetch stories' });
    }
});

// Get single story
router.get('/:id', authenticateToken, async (req: any, res) => {
    try {
        const story = await db.getStoryById(req.params.id);
        if (!story || story.userId !== req.user.id) {
            return res.status(404).json({ error: 'Story not found' });
        }
        res.json(story);
    } catch (error) {
        console.error('[Stories] Error fetching story:', error);
        res.status(500).json({ error: 'Failed to fetch story' });
    }
});

// Create story
router.post('/', authenticateToken, async (req: any, res) => {
    try {
        const { title, premise, data } = req.body;

        const newStory = {
            id: uuidv4(),
            userId: req.user.id,
            title: title || 'Untitled Story',
            premise: premise || '',
            lastUpdated: new Date().toISOString(),
            data: data || {}
        };

        await db.addStory(newStory);
        res.status(201).json(newStory);
    } catch (error) {
        console.error('[Stories] Error creating story:', error);
        res.status(500).json({ error: 'Failed to create story' });
    }
});

// Update story
router.put('/:id', authenticateToken, async (req: any, res) => {
    try {
        const story = await db.getStoryById(req.params.id);
        if (!story || story.userId !== req.user.id) {
            return res.status(404).json({ error: 'Story not found' });
        }

        const { title, premise, data } = req.body;
        const updates = {
            title: title || story.title,
            premise: premise || story.premise,
            data: data || story.data,
            lastUpdated: new Date().toISOString()
        };

        await db.updateStory(req.params.id, updates);

        const updatedStory = { ...story, ...updates };
        res.json(updatedStory);
    } catch (error) {
        console.error('[Stories] Error updating story:', error);
        res.status(500).json({ error: 'Failed to update story' });
    }
});

// Delete story
router.delete('/:id', authenticateToken, async (req: any, res) => {
    try {
        const story = await db.getStoryById(req.params.id);
        if (!story || story.userId !== req.user.id) {
            return res.status(404).json({ error: 'Story not found' });
        }

        await db.deleteStory(req.params.id);
        res.json({ message: 'Story deleted' });
    } catch (error) {
        console.error('[Stories] Error deleting story:', error);
        res.status(500).json({ error: 'Failed to delete story' });
    }
});

export default router;
