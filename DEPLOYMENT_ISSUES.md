# StoryWeaver Deployment Issues & Fixes

## Problems Identified (December 24, 2024)

### 1. **User Persistence Issue** ❌ CRITICAL

**Problem**: Users cannot log back in after registering. Must re-register every time.

**Root Cause**:

- Render Free Tier uses **ephemeral storage**
- The `data/db.json` file is deleted/reset when the server restarts
- Render free tier servers auto-sleep after 15 minutes of inactivity
- Database file is 54.6 MB - too large, causing memory issues

**Solution**: Implement PostgreSQL database or upgrade to Render paid tier

### 2. **API Calls Failing** ❌ CRITICAL

**Problem**: Only text analyzer works. Map generation, character creation, and other AI features fail.

**Root Cause**:

- Backend API runs out of memory processing large requests
- No proper error handling on frontend
- API timeout issues on Render free tier (30 second limit)

**Solution**:

- Add error handling to frontend
- Implement request queuing
- Add timeout handling
- Reduce payload sizes

### 3. **Large Database File** ⚠️ WARNING

**Problem**: Database file is 54.6 MB

**Root Cause**:

- Stories with full text, images, storyboards accumulating
- No cleanup mechanism

**Solution**:

- Implement database cleanup
- Add pagination
- Store images separately (S3, Cloudinary)

## Recommended Fixes

### Option A: Quick Fix (GitHub Pages Only Mode)

Use localStorage for user data (client-side only, no backend):

- ✅ No server needed
- ✅ Free
- ❌ Data lost when clearing browser cache
- ❌ Can't share between devices

### Option B: Add PostgreSQL (Render)

Add free PostgreSQL database to Render:

- ✅ Persistent storage
- ✅ Still free tier
- ✅ Scales better
- ⚠️ Requires migration

### Option C: Upgrade Render Plan

Upgrade to Render Starter ($7/month):

- ✅ Persistent disk storage
- ✅ More memory (1GB vs 512MB)
- ✅ No auto-sleep
- ❌ Costs money

## Current Status

- ✅ Backend is running: <https://storyweaver-api.onrender.com>
- ✅ Frontend is deployed: GitHub Pages
- ❌ User persistence broken
- ❌ Most AI features failing
- ⚠️ Database too large (54.6 MB)
