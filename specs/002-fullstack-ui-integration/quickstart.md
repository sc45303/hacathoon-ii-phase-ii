# Quickstart Guide: Full-Stack Integration & UI Experience

**Feature**: 002-fullstack-ui-integration
**Date**: 2026-01-09
**Purpose**: Testing and validation guide for integration and UI polish

## Overview

This guide helps developers and reviewers quickly set up, test, and validate the Full-Stack Integration & UI Experience feature. Since this feature builds on existing implementations (Specs 1 & 2), most setup is already complete.

## Prerequisites

Before testing this feature, ensure:

1. **Specs 1 & 2 are complete**:
   - ✅ Task CRUD endpoints working (Spec 1)
   - ✅ Authentication & JWT working (Spec 2)
   - ✅ Database migrations applied
   - ✅ Environment variables configured

2. **Development environment**:
   - Node.js 18+ installed
   - Python 3.11+ installed
   - PostgreSQL database accessible (Neon or local)
   - Git repository cloned

## Quick Setup (5 minutes)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already done)
pip install -r requirements.txt

# Verify environment variables
cat .env
# Should contain:
# - DATABASE_URL
# - BETTER_AUTH_SECRET
# - JWT_ALGORITHM=HS256
# - JWT_EXPIRATION_DAYS=7

# Apply migrations (if not already done)
python -m alembic upgrade head

# Start backend server
python -m uvicorn src.main:app --reload

# Server should start at http://localhost:8000
# Verify: Open http://localhost:8000/docs (Swagger UI)
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory (in new terminal)
cd frontend

# Install dependencies (if not already done)
npm install

# Verify environment variables
cat .env.local
# Should contain:
# - NEXT_PUBLIC_API_URL=http://localhost:8000
# - BETTER_AUTH_SECRET (same as backend)

# Start frontend server
npm run dev

# Server should start at http://localhost:3000
# Verify: Open http://localhost:3000
```

### 3. Verify Setup

**Backend Health Check**:
```bash
curl http://localhost:8000/health
# Expected: {"status":"healthy"}
```

**Frontend Access**:
- Open http://localhost:3000
- Should redirect to http://localhost:3000/auth/signin
- Signin page should load without errors

## Testing User Stories

### P1: Complete Authentication Flow (MVP)

**Test Scenario**: New user signup → signin → task management

**Steps**:

1. **Navigate to signup**:
   ```
   Open: http://localhost:3000/auth/signup
   ```

2. **Test validation errors**:
   - Try empty email → Should show "Email is required"
   - Try invalid email (e.g., "notanemail") → Should show "Invalid email format"
   - Try weak password (e.g., "pass") → Should show password requirements
   - Try short name → Should show "Name is required"

3. **Create account**:
   - Email: `test@example.com`
   - Password: `TestPass123`
   - Name: `Test User`
   - Click "Sign Up"
   - **Expected**: Redirect to signin page with success message

4. **Sign in**:
   - Email: `test@example.com`
   - Password: `TestPass123`
   - Click "Sign In"
   - **Expected**: Redirect to home page (http://localhost:3000)

5. **Verify authenticated state**:
   - Header should show "Welcome, Test User"
   - "Sign Out" button should be visible
   - Task form and list should be visible

6. **Sign out**:
   - Click "Sign Out" button
   - **Expected**: Redirect to signin page
   - **Expected**: Cannot access home page without signin

**Pass Criteria**:
- ✅ Validation errors display inline
- ✅ Signup creates account successfully
- ✅ Signin issues JWT token
- ✅ Home page shows user profile
- ✅ Sign out clears session

---

### P2: Responsive UI States

**Test Scenario**: Loading, empty, and error states

**Steps**:

1. **Test loading state**:
   - Sign in as test user
   - Observe task list loading
   - **Expected**: Loading spinner with "Loading tasks..." message
   - **Expected**: Spinner disappears when tasks load

2. **Test empty state**:
   - If no tasks exist:
   - **Expected**: "No tasks yet" message
   - **Expected**: Call-to-action to create first task
   - **Expected**: Empty state is centered and clear

3. **Test error state**:
   - Stop backend server (Ctrl+C in backend terminal)
   - Try to create a task
   - **Expected**: Error message "Unable to connect to server"
   - **Expected**: Retry button appears
   - Restart backend server
   - Click retry button
   - **Expected**: Operation succeeds

4. **Test form loading state**:
   - Create a task
   - Observe submit button during API call
   - **Expected**: Button shows "Creating..." and is disabled
   - **Expected**: Button returns to normal after success

5. **Test token expiration** (optional - requires waiting 7 days or manual token manipulation):
   - With expired token, try to access home page
   - **Expected**: Redirect to signin with "Session expired" message

**Pass Criteria**:
- ✅ Loading states appear within 100ms
- ✅ Empty states provide clear guidance
- ✅ Error messages are actionable
- ✅ Form buttons show loading state
- ✅ Token expiration handled gracefully

---

### P3: Responsive Design

**Test Scenario**: Mobile, tablet, desktop layouts

**Steps**:

1. **Test desktop layout (≥1024px)**:
   - Open browser DevTools (F12)
   - Set viewport to 1920x1080
   - **Expected**: Three-column layout
   - **Expected**: Task form (left), filters (middle), task list (right)

2. **Test tablet layout (768px-1023px)**:
   - Set viewport to 768x1024
   - **Expected**: Two-column layout
   - **Expected**: Task form and filters stacked (left), task list (right)

3. **Test mobile layout (<768px)**:
   - Set viewport to 375x667 (iPhone SE)
   - **Expected**: Single-column layout
   - **Expected**: All elements stacked vertically
   - **Expected**: No horizontal scrolling

4. **Test touch targets**:
   - On mobile viewport, inspect buttons
   - **Expected**: All buttons are at least 44x44px
   - **Expected**: Adequate spacing between interactive elements

5. **Test signin/signup forms**:
   - Navigate to signin page on mobile
   - **Expected**: Form is centered and readable
   - **Expected**: Input fields use appropriate types (email, password)
   - **Expected**: Keyboard doesn't obscure form fields

**Pass Criteria**:
- ✅ Layouts adapt to viewport width
- ✅ No horizontal scrolling on any device
- ✅ Touch targets are 44x44px minimum
- ✅ Forms are usable on mobile
- ✅ Text is readable without zooming

---

### P4: Centralized API Communication

**Test Scenario**: Verify API client consistency

**Steps**:

1. **Verify JWT token inclusion**:
   - Sign in as test user
   - Open browser DevTools → Network tab
   - Create a task
   - Inspect POST /api/tasks request
   - **Expected**: Authorization header present: `Bearer <token>`

2. **Verify 401 handling**:
   - Clear localStorage (DevTools → Application → Local Storage → Clear)
   - Try to access home page
   - **Expected**: Automatic redirect to signin
   - **Expected**: No console errors

3. **Verify error formatting**:
   - Sign in
   - Stop backend server
   - Try to create a task
   - Open browser console
   - **Expected**: APIError with status, detail, error_code
   - **Expected**: Error displayed in UI (not just console)

4. **Verify all endpoints use fetchAPI**:
   - Review code: `frontend/src/lib/api.ts`
   - **Expected**: All API functions use fetchAPI helper
   - **Expected**: No direct fetch() calls in components

**Pass Criteria**:
- ✅ JWT tokens included automatically
- ✅ 401 errors trigger signin redirect
- ✅ Errors formatted consistently
- ✅ All API calls use centralized client
- ✅ No unhandled promise rejections

---

### P5: Environment Coordination

**Test Scenario**: Setup and configuration

**Steps**:

1. **Verify environment variables**:
   ```bash
   # Backend
   grep BETTER_AUTH_SECRET backend/.env

   # Frontend
   grep BETTER_AUTH_SECRET frontend/.env.local

   # Expected: Both values match exactly
   ```

2. **Test with missing environment variable**:
   - Temporarily rename `backend/.env` to `backend/.env.backup`
   - Try to start backend
   - **Expected**: Clear error message about missing variables
   - Restore `backend/.env`

3. **Test with mismatched secrets**:
   - Change BETTER_AUTH_SECRET in `frontend/.env.local`
   - Sign in
   - **Expected**: Token verification fails
   - **Expected**: Clear error message
   - Restore correct secret

4. **Verify README documentation**:
   - Read `backend/README.md`
   - **Expected**: Authentication setup instructions present
   - **Expected**: Environment variable documentation
   - Read `frontend/README.md`
   - **Expected**: Better Auth configuration notes
   - **Expected**: Setup instructions

**Pass Criteria**:
- ✅ Environment variables documented
- ✅ Missing variables show clear errors
- ✅ Mismatched secrets are detected
- ✅ README files are up-to-date
- ✅ Setup takes under 10 minutes

---

## Common Issues & Solutions

### Issue: "404 Not Found" on /api/auth/signup

**Cause**: Auth router not registered in backend/src/main.py

**Solution**:
```python
# In backend/src/main.py, ensure:
from .api.routes import tasks, auth

app.include_router(auth.router)  # Must be present
app.include_router(tasks.router)
```

### Issue: "Token signature verification failed"

**Cause**: BETTER_AUTH_SECRET differs between frontend and backend

**Solution**:
```bash
# Verify secrets match:
grep BETTER_AUTH_SECRET backend/.env
grep BETTER_AUTH_SECRET frontend/.env.local

# If different, copy backend secret to frontend
```

### Issue: "Unable to connect to database"

**Cause**: DATABASE_URL is incorrect or database is not running

**Solution**:
```bash
# For Neon PostgreSQL:
# Verify connection string in backend/.env includes ?sslmode=require

# For local PostgreSQL:
# Ensure PostgreSQL is running:
# Windows: Check Services
# Mac/Linux: sudo systemctl status postgresql
```

### Issue: Frontend shows blank page

**Cause**: JavaScript error or build issue

**Solution**:
```bash
# Check browser console for errors
# Clear Next.js cache:
cd frontend
rm -rf .next
npm run dev
```

### Issue: Tasks not loading

**Cause**: JWT token missing or invalid

**Solution**:
```bash
# Check localStorage in browser DevTools:
# Application → Local Storage → http://localhost:3000
# Look for 'auth_session' key

# If missing or invalid, sign out and sign in again
```

## Performance Benchmarks

**Expected Performance**:
- Loading states appear: <100ms
- Page transitions: <500ms
- API responses: <200ms
- Task list load (10 tasks): <300ms
- Signup/signin: <1s

**How to Measure**:
```javascript
// In browser console:
performance.mark('start');
// Perform action (e.g., create task)
performance.mark('end');
performance.measure('action', 'start', 'end');
console.log(performance.getEntriesByType('measure'));
```

## Validation Checklist

Before marking this feature complete, verify:

**Authentication Flow**:
- [ ] Signup form validates inputs
- [ ] Signup creates user in database
- [ ] Signin issues JWT token
- [ ] Home page shows user profile
- [ ] Sign out clears session

**UI States**:
- [ ] Loading spinners appear during async operations
- [ ] Empty states show helpful messages
- [ ] Error messages are clear and actionable
- [ ] Form buttons show loading state

**Responsive Design**:
- [ ] Desktop layout (3 columns) works at 1920px
- [ ] Tablet layout (2 columns) works at 768px
- [ ] Mobile layout (1 column) works at 375px
- [ ] No horizontal scrolling on any device
- [ ] Touch targets are 44x44px minimum

**API Communication**:
- [ ] JWT tokens included in all requests
- [ ] 401 errors trigger signin redirect
- [ ] Errors formatted consistently
- [ ] No unhandled promise rejections

**Environment Setup**:
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Environment variables documented
- [ ] README files are accurate

## Next Steps

After validating all user stories:

1. **Mark tasks complete** in `tasks.md`
2. **Document any issues** found during testing
3. **Create git commit** with implementation
4. **Prepare for demo** (if hackathon submission)

## Support

For issues or questions:
- Review specification: `specs/002-fullstack-ui-integration/spec.md`
- Review implementation plan: `specs/002-fullstack-ui-integration/plan.md`
- Check API reference: `specs/002-fullstack-ui-integration/contracts/existing-api-reference.yaml`
- Review existing specs: `specs/001-auth-security/`
