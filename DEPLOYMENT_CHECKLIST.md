# 🚀 Deployment Checklist

## Pre-Deployment

### Backend Preparation
- [ ] All backend code is committed to Git
- [ ] `requirements.txt` is up to date
- [ ] Database migrations are ready (`alembic/versions/`)
- [ ] `.env.example` exists with all required variables
- [ ] Dockerfile is created
- [ ] .dockerignore is created
- [ ] README_HF.md is created

### Frontend Preparation
- [ ] All frontend code is committed to Git
- [ ] `npm run build` succeeds locally
- [ ] No TypeScript errors
- [ ] All dependencies in package.json
- [ ] .env.production.example is created
- [ ] vercel.json is created

### Database
- [ ] Neon PostgreSQL database is created
- [ ] Database connection string is available
- [ ] Database is not paused

### Secrets
- [ ] Generate BETTER_AUTH_SECRET: `openssl rand -hex 32`
- [ ] Save all secrets securely

---

## Backend Deployment (Hugging Face)

### Step 1: Create Space
- [ ] Go to https://huggingface.co/
- [ ] Sign in or create account
- [ ] Click "New Space"
- [ ] Name: `taskflow-api`
- [ ] SDK: Docker
- [ ] License: MIT
- [ ] Click "Create Space"

### Step 2: Upload Code
- [ ] Clone Space: `git clone https://huggingface.co/spaces/USERNAME/taskflow-api`
- [ ] Copy backend files to Space directory
- [ ] Rename `README_HF.md` to `README.md`
- [ ] Commit: `git add . && git commit -m "Initial deployment"`
- [ ] Push: `git push`

### Step 3: Configure Secrets
- [ ] Go to Space Settings → Repository secrets
- [ ] Add `DATABASE_URL` (from Neon)
- [ ] Add `BETTER_AUTH_SECRET` (generated)
- [ ] Add `CORS_ORIGINS` (will update after frontend deploy)
- [ ] Add `DEBUG=False`
- [ ] Save all secrets

### Step 4: Verify Deployment
- [ ] Wait for build to complete (2-5 minutes)
- [ ] Check Logs tab for errors
- [ ] Test health endpoint: `https://USERNAME-taskflow-api.hf.space/health`
- [ ] Visit API docs: `https://USERNAME-taskflow-api.hf.space/docs`
- [ ] Save your Space URL: `_______________________________`

---

## Frontend Deployment (Vercel)

### Step 1: Push to GitHub
- [ ] Create GitHub repository
- [ ] Initialize Git: `git init`
- [ ] Add remote: `git remote add origin https://github.com/USERNAME/REPO.git`
- [ ] Commit all: `git add . && git commit -m "Ready for deployment"`
- [ ] Push: `git push -u origin main`

### Step 2: Import to Vercel
- [ ] Go to https://vercel.com/
- [ ] Sign in with GitHub
- [ ] Click "Add New..." → "Project"
- [ ] Select your repository
- [ ] Click "Import"

### Step 3: Configure Project
- [ ] Framework: Next.js (auto-detected)
- [ ] Root Directory: `frontend`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `.next`
- [ ] Install Command: `npm install`

### Step 4: Add Environment Variable
- [ ] Click "Environment Variables"
- [ ] Add `NEXT_PUBLIC_API_URL`
- [ ] Value: Your Hugging Face Space URL
- [ ] Click "Deploy"

### Step 5: Verify Deployment
- [ ] Wait for build (2-3 minutes)
- [ ] Check build logs for errors
- [ ] Visit your Vercel URL
- [ ] Save your Vercel URL: `_______________________________`

---

## Post-Deployment

### Update Backend CORS
- [ ] Go to Hugging Face Space Settings
- [ ] Update `CORS_ORIGINS` secret
- [ ] Add your Vercel URL: `https://your-app.vercel.app,https://your-app-*.vercel.app`
- [ ] Factory reboot Space

### Test Complete Application
- [ ] Visit Vercel URL
- [ ] Test landing page loads
- [ ] Test hero animations
- [ ] Test navbar (desktop and mobile)
- [ ] Click "Sign Up"
- [ ] Create account
- [ ] Sign in
- [ ] Create a task
- [ ] Edit a task
- [ ] Complete a task
- [ ] Delete a task
- [ ] Test filters
- [ ] Test "About" page
- [ ] Test 404 page (visit invalid URL)
- [ ] Test sign out

### Performance Check
- [ ] Run Lighthouse audit
- [ ] Check page load speed
- [ ] Test on mobile device
- [ ] Test on different browsers

---

## Troubleshooting

### Backend Issues
- [ ] Check Hugging Face Logs tab
- [ ] Verify DATABASE_URL is correct
- [ ] Test database connection from Neon dashboard
- [ ] Verify all secrets are set
- [ ] Check CORS configuration

### Frontend Issues
- [ ] Check Vercel build logs
- [ ] Verify NEXT_PUBLIC_API_URL is correct
- [ ] Check browser console for errors
- [ ] Test API endpoint directly
- [ ] Clear browser cache

### Common Errors

**"Failed to fetch"**
- [ ] Check CORS_ORIGINS includes Vercel URL
- [ ] Verify backend is running
- [ ] Check NEXT_PUBLIC_API_URL is correct

**"Database connection failed"**
- [ ] Verify DATABASE_URL format
- [ ] Check Neon database is not paused
- [ ] Test connection from Neon dashboard

**"Build failed"**
- [ ] Run `npm run build` locally
- [ ] Fix TypeScript errors
- [ ] Check all dependencies installed

---

## Success Criteria

### Backend
- ✅ Space shows "Running" status
- ✅ Health endpoint returns `{"status": "healthy"}`
- ✅ API docs accessible at `/docs`
- ✅ No errors in Logs tab

### Frontend
- ✅ Deployment shows "Ready" status
- ✅ Landing page loads with animations
- ✅ Can sign up and sign in
- ✅ Can create and manage tasks
- ✅ All pages accessible

### Integration
- ✅ Frontend can communicate with backend
- ✅ Authentication works end-to-end
- ✅ Task CRUD operations work
- ✅ No CORS errors in browser console

---

## Optional Enhancements

### Custom Domain
- [ ] Purchase domain
- [ ] Add to Vercel project
- [ ] Configure DNS
- [ ] Update backend CORS

### Monitoring
- [ ] Set up Vercel Analytics
- [ ] Monitor Hugging Face Space logs
- [ ] Set up error tracking (Sentry)

### CI/CD
- [ ] Set up GitHub Actions
- [ ] Automated testing
- [ ] Automated deployments

---

## Deployment URLs

**Backend (Hugging Face):**
```
https://YOUR_USERNAME-taskflow-api.hf.space
```

**Frontend (Vercel):**
```
https://taskflow-app.vercel.app
```

**API Documentation:**
```
https://YOUR_USERNAME-taskflow-api.hf.space/docs
```

---

## Support Resources

- **Hugging Face Docs**: https://huggingface.co/docs/hub/spaces
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com/

---

## Notes

- Free tier limits:
  - Hugging Face: CPU basic (sufficient for this app)
  - Vercel: 100GB bandwidth/month
  - Neon: 0.5GB storage

- Upgrade if needed:
  - More traffic → Upgrade Vercel
  - More compute → Upgrade Hugging Face
  - More storage → Upgrade Neon

---

## Completion

Date deployed: _______________

Backend URL: _______________

Frontend URL: _______________

Status: ⬜ In Progress  ⬜ Deployed  ⬜ Tested  ⬜ Live

Notes:
_________________________________
_________________________________
_________________________________
