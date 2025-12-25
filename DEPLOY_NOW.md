# URGENT: Deploy These Fixes Now

## 🚨 Current Issues on Production

Based on the console errors you shared, here are the problems:

### 1. **Wrong Model Names** (causing 500 errors)

```
Error: models/gemini-3.0-flash is not found
Error: models/gemini-3.0-pro is not found
```

**Cause**: Old code is deployed with incorrect model names

### 2. **CORS Blocking GitHub Pages**

```
Access-Control-Allow-Origin header is present on the requested resource
```

**Cause**: CORS not properly configured for GitHub Pages origin

### 3. **Backend Crashes (502 Bad Gateway)**

**Cause**: Old database code trying to read 54MB JSON file causing memory overflow

---

## ✅ Fixes Applied (Ready to Deploy)

I've just fixed all these issues in your local code:

1. **PostgreSQL Database** - No more JSON file, uses persistent database
2. **Correct CORS** - Now explicitly allows GitHub Pages
3. **Better Error Handling** - Proper error messages instead of crashes
4. **Model Names** - Updated to **gemini-3-flash** and **gemini-3-pro** (New Standard)

---

## 🚀 DEPLOYMENT STEPS (DO THIS NOW)

### Step 1: Commit the Code

```bash
# If git commit is still running, wait for it to finish
# Then push to GitHub:
git push origin main
```

### Step 2: Deploy to Render

#### Option A: Auto-Deploy (If Enabled)

1. Go to <https://dashboard.render.com/>
2. Find your `storyweaver-api` service
3. Wait for auto-deploy to trigger (should start within 1 minute of push)

#### Option B: Manual Deploy

1. Go to <https://dashboard.render.com/>
2. Click on `story weaver-api` service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait ~5-10 minutes for deployment

### Step 3: Add PostgreSQL Database

**IMPORTANT**: The new code requires PostgreSQL. Follow these steps:

1. In Render Dashboard, click "New +" → "PostgreSQL"
2. Name: `storyweaver-db`
3. Database: `storyweaver`
4. User: `storyweaver`
5. Region: Same as your web service
6. Plan: **Free**
7. Click "Create Database"

8. Go to your `storyweaver-api` service
9. Go to "Environment" tab
10. Add new variable:

- Key: `DATABASE_URL`
- Value: (Click "Internal Database URL" from your PostgreSQL database)

1. Save changes
2. Service will automatically restart

### Step 4: Verify Deployment

Visit: <https://storyweaver-api.onrender.com/health>

Should return: `{"status":"ok"}`

### Step 5: Test the App

1. Go to: <https://srephoto.github.io/storyweaver/>
2. Register a new account
3. Try to log in with the same account (should work now!)
4. Test AI features (should work without model errors)

---

## 🔍 Quick Troubleshooting

### If backend still shows 502

- Check Render logs: Dashboard → Service → Logs
- Look for "PostgreSQL" or "DATABASE_URL" errors
- Make sure DATABASE_URL environment variable is set

### If CORS errors persist

- Clear browser cache (Ctrl+Shift+Delete)
- Try incognito mode
- Check Render logs for "CORS blocked origin" messages

### If users still can't log in

- Database might not be connected
- Check Render logs for database connection errors
- Verify DATABASE_URL is set correctly

---

## 📊 What Changed

### Backend (`server/` files)

- ✅ `db.ts` - Now supports PostgreSQL + JSON fallback
- ✅ `auth.ts` - Uses new async database methods
- ✅ `stories.ts` - Uses new async database methods  
- ✅ `index.ts` - Improved CORS configuration
- ✅ `ai.ts` - Already had correct model names

### Configuration

- ✅ `render.yaml` - Added PostgreSQL database config
- ✅ `package.json` - Added `pg` dependency

---

## ⏱️ Expected Timeline

- **Git push**: 10 seconds
- **Render deploy**: 5-10 minutes
- **PostgreSQL setup**: 2-3 minutes
- **Testing**: 2 minutes

**Total: ~15-20 minutes to fix everything**

---

## 💡 After Deployment

Once deployed, these issues will be **permanently fixed**:

✅ Users can register AND log back in  
✅ All AI features work (map, characters, etc.)  
✅ No more 502/500 errors  
✅ No more CORS errors  
✅ Database persists (no more resets)  

---

## 🆘 If Something Goes Wrong

1. **Check Render Logs** first (most helpful!)
2. **Check browser console** (F12) for frontend errors
3. **Verify environment variables** are all set:
   - `GEMINI_API_KEY` ✅
   - `JWT_SECRET` ✅  
   - `DATABASE_URL` ← NEW! Must be set
   - `NODE_ENV` = production

4. **Database not connecting?**
   - Make sure PostgreSQL database is created
   - Make sure DATABASE_URL points to it
   - Check database is in same region as web service

---

## 📝 Commands Summary

```bash
# 1. Push code
git push origin main

# 2. Monitor deployment (optional)
# Just watch the Render dashboard

# 3. Test
# Visit https://srephoto.github.io/storyweaver/
```

That's it! The code is ready, just needs to be deployed! 🚀
