# 🚀 Complete Deployment Guide

## Overview
- **Backend**: Hugging Face Spaces (Docker)
- **Frontend**: Vercel
- **Database**: Neon PostgreSQL (already set up)

---

## Part 1: Deploy Backend to Hugging Face Spaces

### Step 1: Prepare Your Backend Code

1. **Ensure all files are ready:**
   ```
   backend/
   ├── Dockerfile ✅ (created)
   ├── README_HF.md ✅ (created)
   ├── .dockerignore ✅ (created)
   ├── requirements.txt ✅
   ├── alembic.ini ✅
   ├── alembic/ ✅
   └── src/ ✅
   ```

2. **Update CORS settings for production:**

   Edit `backend/src/core/config.py` and change:
   ```python
   CORS_ORIGINS: str = "http://localhost:3000"
   ```

   To allow your Vercel domain (we'll update this after deploying frontend):
   ```python
   CORS_ORIGINS: str = "http://localhost:3000,https://your-app.vercel.app"
   ```

### Step 2: Create Hugging Face Space

1. **Go to Hugging Face:**
   - Visit https://huggingface.co/
   - Sign in or create an account

2. **Create a new Space:**
   - Click your profile → "New Space"
   - **Space name**: `taskflow-api` (or your preferred name)
   - **License**: MIT
   - **Select SDK**: Docker
   - **Space hardware**: CPU basic (free tier)
   - Click "Create Space"

### Step 3: Push Code to Hugging Face

**Option A: Using Git (Recommended)**

1. **Clone your new Space:**
   ```bash
   git clone https://huggingface.co/spaces/YOUR_USERNAME/taskflow-api
   cd taskflow-api
   ```

2. **Copy backend files:**
   ```bash
   # Copy all backend files to the Space directory
   cp -r /path/to/backend/* .
   ```

3. **Rename README_HF.md to README.md:**
   ```bash
   mv README_HF.md README.md
   ```

4. **Commit and push:**
   ```bash
   git add .
   git commit -m "Initial backend deployment"
   git push
   ```

**Option B: Using Hugging Face Web Interface**

1. Go to your Space's "Files" tab
2. Click "Add file" → "Upload files"
3. Upload all backend files (Dockerfile, src/, requirements.txt, etc.)
4. Rename README_HF.md to README.md

### Step 4: Configure Environment Variables

1. **Go to your Space settings:**
   - Click "Settings" tab in your Space

2. **Add Repository secrets (Environment Variables):**

   Click "New secret" for each:

   **Required Variables:**
   ```
   Name: DATABASE_URL
   Value: postgresql://username:password@host/database
   (Get this from your Neon dashboard)

   Name: BETTER_AUTH_SECRET
   Value: your-super-secret-key-here
   (Generate: openssl rand -hex 32)

   Name: CORS_ORIGINS
   Value: http://localhost:3000,https://your-app.vercel.app
   (Update after deploying frontend)

   Name: DEBUG
   Value: False
   ```

   **Optional Variables:**
   ```
   Name: JWT_ALGORITHM
   Value: HS256

   Name: JWT_EXPIRATION_DAYS
   Value: 7
   ```

3. **Save all secrets**

### Step 5: Wait for Build

1. Your Space will automatically build
2. Check the "Logs" tab to monitor progress
3. Build takes 2-5 minutes
4. Once complete, you'll see "Running" status

### Step 6: Test Your Backend

1. **Get your Space URL:**
   - Format: `https://YOUR_USERNAME-taskflow-api.hf.space`

2. **Test endpoints:**
   ```bash
   # Health check
   curl https://YOUR_USERNAME-taskflow-api.hf.space/health

   # API docs
   # Visit: https://YOUR_USERNAME-taskflow-api.hf.space/docs
   ```

3. **Expected response:**
   ```json
   {"status": "healthy"}
   ```

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Prepare Frontend for Deployment

1. **Update API URL in frontend:**

   Create `frontend/.env.production`:
   ```env
   NEXT_PUBLIC_API_URL=https://YOUR_USERNAME-taskflow-api.hf.space
   ```

2. **Ensure package.json has build script:**
   ```json
   {
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start"
     }
   }
   ```

3. **Test build locally:**
   ```bash
   cd frontend
   npm run build
   ```

   Fix any build errors before deploying.

### Step 2: Push Code to GitHub

1. **Initialize Git (if not already):**
   ```bash
   cd /path/to/evolution-of-todo/phase-2-full-stack-web-app
   git init
   git add .
   git commit -m "Ready for deployment"
   ```

2. **Create GitHub repository:**
   - Go to https://github.com/new
   - Name: `taskflow-app` (or your preferred name)
   - Make it Public or Private
   - Don't initialize with README (you already have one)
   - Click "Create repository"

3. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/taskflow-app.git
   git branch -M main
   git push -u origin main
   ```

### Step 3: Deploy to Vercel

1. **Go to Vercel:**
   - Visit https://vercel.com/
   - Sign in with GitHub

2. **Import Project:**
   - Click "Add New..." → "Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project:**

   **Framework Preset:** Next.js (auto-detected)

   **Root Directory:** `frontend`

   **Build Settings:**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Environment Variables:**

   Click "Environment Variables" and add:
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://YOUR_USERNAME-taskflow-api.hf.space
   ```

5. **Click "Deploy"**

### Step 4: Wait for Deployment

1. Vercel will build and deploy (2-3 minutes)
2. Watch the build logs
3. Once complete, you'll get a URL like:
   - `https://taskflow-app.vercel.app`

### Step 5: Update Backend CORS

1. **Go back to Hugging Face Space settings**

2. **Update CORS_ORIGINS secret:**
   ```
   Name: CORS_ORIGINS
   Value: https://taskflow-app.vercel.app,https://taskflow-app-*.vercel.app
   ```

   (The wildcard allows preview deployments)

3. **Restart your Space:**
   - Go to Space settings
   - Click "Factory reboot"

---

## Part 3: Final Testing

### Test Complete Flow

1. **Visit your Vercel URL:**
   ```
   https://taskflow-app.vercel.app
   ```

2. **Test landing page:**
   - ✅ Hero animations work
   - ✅ Features section loads
   - ✅ CTA buttons work

3. **Test authentication:**
   - Click "Sign Up"
   - Create an account
   - Should redirect to Sign In
   - Sign in with credentials
   - Should redirect to Dashboard

4. **Test task management:**
   - Create a task
   - Edit a task
   - Complete a task
   - Delete a task
   - Test filters

5. **Test navigation:**
   - Click "About" in navbar
   - Click "Home" in navbar
   - Test mobile menu (resize browser)

### Troubleshooting

**Backend Issues:**

1. **Space won't build:**
   - Check Logs tab for errors
   - Verify Dockerfile syntax
   - Ensure all dependencies in requirements.txt

2. **Database connection fails:**
   - Verify DATABASE_URL is correct
   - Check Neon dashboard for connection string
   - Ensure database is not paused

3. **CORS errors:**
   - Update CORS_ORIGINS to include Vercel URL
   - Restart Space after updating
   - Clear browser cache

**Frontend Issues:**

1. **Build fails:**
   - Check build logs in Vercel
   - Test `npm run build` locally first
   - Fix TypeScript errors

2. **API calls fail:**
   - Verify NEXT_PUBLIC_API_URL is correct
   - Check browser console for errors
   - Test backend URL directly

3. **Animations don't work:**
   - Check browser console for errors
   - Verify Framer Motion and GSAP installed
   - Clear browser cache

---

## Part 4: Custom Domain (Optional)

### Add Custom Domain to Vercel

1. **Go to Vercel project settings**
2. Click "Domains"
3. Add your domain
4. Follow DNS configuration instructions
5. Wait for DNS propagation (up to 48 hours)

### Update Backend CORS

After adding custom domain:
```
CORS_ORIGINS: https://yourdomain.com,https://taskflow-app.vercel.app
```

---

## Part 5: Monitoring & Maintenance

### Hugging Face Space

**Monitor:**
- Check Logs tab regularly
- Watch for errors or crashes
- Monitor Space status

**Update:**
```bash
git pull
# Make changes
git add .
git commit -m "Update backend"
git push
```

### Vercel

**Monitor:**
- Check Analytics tab
- Review deployment logs
- Monitor performance

**Update:**
```bash
git add .
git commit -m "Update frontend"
git push
```
Vercel auto-deploys on push to main branch.

---

## Environment Variables Summary

### Backend (Hugging Face)
```env
DATABASE_URL=postgresql://user:pass@host/db
BETTER_AUTH_SECRET=your-secret-key
CORS_ORIGINS=https://your-app.vercel.app
DEBUG=False
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DAYS=7
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://your-space.hf.space
```

---

## Security Checklist

- ✅ DEBUG=False in production
- ✅ Strong BETTER_AUTH_SECRET (32+ characters)
- ✅ CORS restricted to your domain
- ✅ Environment variables in secrets (not in code)
- ✅ Database credentials secure
- ✅ HTTPS enabled (automatic on both platforms)

---

## Cost Breakdown

**Hugging Face Spaces:**
- Free tier: CPU basic (sufficient for this app)
- Upgrade if needed: ~$0.60/hour for better CPU

**Vercel:**
- Free tier: 100GB bandwidth, unlimited deployments
- Hobby plan: Free for personal projects
- Pro plan: $20/month (if needed)

**Neon PostgreSQL:**
- Free tier: 0.5GB storage, 1 project
- Pro plan: $19/month (if needed)

**Total Cost:** $0/month on free tiers! 🎉

---

## Next Steps

1. ✅ Deploy backend to Hugging Face
2. ✅ Deploy frontend to Vercel
3. ✅ Test complete application
4. 📊 Monitor performance
5. 🔄 Set up CI/CD (optional)
6. 📱 Add PWA support (optional)
7. 🌐 Add custom domain (optional)

---

## Support

**Issues?**
- Check deployment logs
- Review error messages
- Test locally first
- Verify environment variables

**Need Help?**
- Hugging Face: https://huggingface.co/docs
- Vercel: https://vercel.com/docs
- Next.js: https://nextjs.org/docs

---

## Congratulations! 🎉

Your TaskFlow application is now live and accessible worldwide!

**Share your app:**
- Frontend: https://your-app.vercel.app
- Backend API: https://your-space.hf.space/docs
