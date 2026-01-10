# Authentication & API Security - Testing Guide

**Feature**: Authentication & API Security (Spec 001)
**Date**: 2026-01-09
**Status**: Ready for Testing

## Prerequisites

Before testing, ensure:

1. **Backend is running**:
   ```bash
   cd backend
   python -m uvicorn src.main:app --reload
   # Should be running at http://localhost:8000
   ```

2. **Database migrations applied**:
   ```bash
   cd backend
   python -m alembic upgrade head
   ```

3. **Frontend is running**:
   ```bash
   cd frontend
   npm run dev
   # Should be running at http://localhost:3000
   ```

4. **Environment variables configured**:
   - `backend/.env` has `BETTER_AUTH_SECRET`
   - `frontend/.env.local` has same `BETTER_AUTH_SECRET`
   - Both secrets match exactly

## Test Suite

### T048: Test Signup Flow End-to-End

**Objective**: Verify new users can create accounts and data is stored correctly in database

**Steps**:

1. **Navigate to signup page**:
   - Open browser to `http://localhost:3000/auth/signup`
   - Verify signup form is displayed with email, password, and name fields

2. **Test validation errors**:
   - Try submitting with empty fields → Should show validation errors
   - Try weak password (e.g., "pass") → Should show "Password must be at least 8 characters"
   - Try invalid email (e.g., "notanemail") → Should show email format error

3. **Create valid account**:
   - Email: `test1@example.com`
   - Password: `SecurePass123`
   - Name: `Test User 1`
   - Click "Sign Up"
   - **Expected**: Success message, redirect to signin page

4. **Verify in database**:
   ```bash
   # Connect to your database and run:
   SELECT id, email, name, password_hash, created_at FROM users WHERE email = 'test1@example.com';
   ```
   - **Expected**: User record exists
   - **Expected**: `password_hash` is bcrypt hash (starts with `$2b$`)
   - **Expected**: `created_at` timestamp is recent

5. **Test duplicate email**:
   - Try signing up again with `test1@example.com`
   - **Expected**: 409 Conflict error "Email already registered"

**Pass Criteria**:
- ✅ Form validation works correctly
- ✅ Valid signup creates user in database
- ✅ Password is hashed (not stored in plain text)
- ✅ Duplicate email is rejected with 409 error
- ✅ User is redirected to signin after successful signup

---

### T049: Test Signin Flow End-to-End

**Objective**: Verify users can authenticate and receive valid JWT tokens

**Steps**:

1. **Navigate to signin page**:
   - Open browser to `http://localhost:3000/auth/signin`
   - Verify signin form is displayed

2. **Test invalid credentials**:
   - Email: `test1@example.com`
   - Password: `WrongPassword123`
   - Click "Sign In"
   - **Expected**: 401 error "Invalid email or password"

3. **Test valid credentials**:
   - Email: `test1@example.com`
   - Password: `SecurePass123`
   - Click "Sign In"
   - **Expected**: Success, redirect to home page (`/`)

4. **Verify JWT token**:
   - Open browser DevTools → Application → Local Storage → `http://localhost:3000`
   - Find `auth_session` key
   - **Expected**: JSON object with `token` and `user` fields
   - Copy the token value

5. **Decode JWT token** (use jwt.io or command line):
   ```bash
   # Using Python
   python -c "import jwt; print(jwt.decode('YOUR_TOKEN_HERE', options={'verify_signature': False}))"
   ```
   - **Expected payload**:
     ```json
     {
       "sub": "1",  // User ID
       "email": "test1@example.com",
       "iat": 1704067200,  // Issued at timestamp
       "exp": 1704672000,  // Expiration (7 days later)
       "iss": "better-auth"
     }
     ```

6. **Verify session persistence**:
   - Refresh the page
   - **Expected**: Still logged in (no redirect to signin)
   - **Expected**: User name displayed in header

7. **Test signout**:
   - Click "Sign Out" button in header
   - **Expected**: Redirect to signin page
   - **Expected**: localStorage `auth_session` is cleared

**Pass Criteria**:
- ✅ Invalid credentials return 401 error
- ✅ Valid credentials return JWT token
- ✅ Token contains correct user_id, email, and expiration
- ✅ Token expiration is 7 days from issuance
- ✅ Session persists across page refreshes
- ✅ Signout clears session and redirects

---

### T050: Test Protected API Access

**Objective**: Verify API endpoints require valid JWT tokens and reject invalid tokens

**Steps**:

1. **Test unauthenticated request**:
   ```bash
   # Try to fetch tasks without token
   curl http://localhost:8000/api/tasks
   ```
   - **Expected**: 401 Unauthorized
   - **Expected**: Response body: `{"detail": "Not authenticated"}`

2. **Test with valid token**:
   - Sign in to get a valid token (from T049)
   - Copy token from localStorage
   ```bash
   # Replace YOUR_TOKEN with actual token
   curl http://localhost:8000/api/tasks \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```
   - **Expected**: 200 OK
   - **Expected**: Returns task list (may be empty)

3. **Test with invalid token**:
   ```bash
   curl http://localhost:8000/api/tasks \
     -H "Authorization: Bearer invalid_token_here"
   ```
   - **Expected**: 401 Unauthorized
   - **Expected**: Error message about invalid token

4. **Test with expired token**:
   - Manually create an expired token or wait 7 days (not practical)
   - Alternative: Temporarily change `JWT_EXPIRATION_DAYS=0` in backend/.env, restart backend, get new token, wait 1 minute
   ```bash
   curl http://localhost:8000/api/tasks \
     -H "Authorization: Bearer EXPIRED_TOKEN"
   ```
   - **Expected**: 401 Unauthorized
   - **Expected**: Error code `TOKEN_EXPIRED`

5. **Test frontend automatic redirect**:
   - In browser, manually edit localStorage to set invalid token
   - Try to access home page (`/`)
   - **Expected**: Automatic redirect to `/auth/signin`

6. **Test all protected endpoints**:
   - With valid token, test:
     - `GET /api/tasks` → 200 OK
     - `POST /api/tasks` → 201 Created
     - `GET /api/tasks/{id}` → 200 OK
     - `PATCH /api/tasks/{id}` → 200 OK
     - `DELETE /api/tasks/{id}` → 204 No Content
     - `GET /api/auth/me` → 200 OK

**Pass Criteria**:
- ✅ Requests without token return 401
- ✅ Requests with valid token succeed
- ✅ Requests with invalid token return 401
- ✅ Requests with expired token return 401 with TOKEN_EXPIRED
- ✅ Frontend automatically redirects on 401
- ✅ All task endpoints require authentication

---

### T051: Test User Data Isolation

**Objective**: Verify users can only access their own tasks, not other users' tasks

**Steps**:

1. **Create two user accounts**:
   - User A: `usera@example.com` / `PasswordA123`
   - User B: `userb@example.com` / `PasswordB123`

2. **Sign in as User A**:
   - Navigate to `/auth/signin`
   - Sign in with User A credentials
   - Copy User A's JWT token from localStorage

3. **Create tasks as User A**:
   - Create 2-3 tasks through the UI
   - Note the task IDs (check Network tab or database)

4. **Sign out and sign in as User B**:
   - Click "Sign Out"
   - Sign in with User B credentials
   - Copy User B's JWT token

5. **Create tasks as User B**:
   - Create 2-3 different tasks through the UI

6. **Verify User B cannot see User A's tasks**:
   - Check the task list in UI
   - **Expected**: Only User B's tasks are visible
   - **Expected**: User A's tasks are NOT visible

7. **Test API-level isolation**:
   ```bash
   # Get User A's task ID from database
   # Try to access it with User B's token
   curl http://localhost:8000/api/tasks/USER_A_TASK_ID \
     -H "Authorization: Bearer USER_B_TOKEN"
   ```
   - **Expected**: 404 Not Found (task doesn't exist for User B)

8. **Test cross-user modification attempt**:
   ```bash
   # Try to update User A's task with User B's token
   curl -X PATCH http://localhost:8000/api/tasks/USER_A_TASK_ID \
     -H "Authorization: Bearer USER_B_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"completed": true}'
   ```
   - **Expected**: 404 Not Found

9. **Test cross-user deletion attempt**:
   ```bash
   # Try to delete User A's task with User B's token
   curl -X DELETE http://localhost:8000/api/tasks/USER_A_TASK_ID \
     -H "Authorization: Bearer USER_B_TOKEN"
   ```
   - **Expected**: 404 Not Found

10. **Verify in database**:
    ```sql
    -- Check that tasks are correctly associated with users
    SELECT id, user_id, title FROM tasks ORDER BY user_id, id;
    ```
    - **Expected**: User A's tasks have `user_id = 1`
    - **Expected**: User B's tasks have `user_id = 2`
    - **Expected**: No cross-contamination

**Pass Criteria**:
- ✅ User A can only see their own tasks
- ✅ User B can only see their own tasks
- ✅ User B cannot access User A's tasks via API (404)
- ✅ User B cannot modify User A's tasks (404)
- ✅ User B cannot delete User A's tasks (404)
- ✅ Database correctly associates tasks with user_id
- ✅ All queries are filtered by authenticated user

---

## Test Results Summary

After completing all tests, fill in the results:

| Test | Status | Notes |
|------|--------|-------|
| T048: Signup Flow | ⬜ Pass / ⬜ Fail | |
| T049: Signin Flow | ⬜ Pass / ⬜ Fail | |
| T050: Protected API | ⬜ Pass / ⬜ Fail | |
| T051: User Isolation | ⬜ Pass / ⬜ Fail | |

## Common Issues & Troubleshooting

### Issue: "BETTER_AUTH_SECRET not found"
- **Cause**: Environment variable not set
- **Fix**: Ensure both `backend/.env` and `frontend/.env.local` have `BETTER_AUTH_SECRET`
- **Verify**: Secrets must be identical in both files

### Issue: "Token signature verification failed"
- **Cause**: Frontend and backend have different secrets
- **Fix**: Copy exact same secret to both .env files
- **Verify**: Run `grep BETTER_AUTH_SECRET backend/.env frontend/.env.local`

### Issue: "401 Unauthorized" on all requests
- **Cause**: Token not being sent or invalid
- **Fix**: Check localStorage has valid token, check Authorization header in Network tab

### Issue: "User can see other users' tasks"
- **Cause**: Missing user_id filter in queries
- **Fix**: Verify `get_current_user` dependency is applied to all task endpoints
- **Check**: `backend/src/api/routes/tasks.py` should use `current_user_id = Depends(get_current_user)`

### Issue: Database migration errors
- **Cause**: Migration not applied or database out of sync
- **Fix**: Run `python -m alembic upgrade head` in backend directory

## Security Checklist

After testing, verify:

- [ ] Passwords are hashed (never stored in plain text)
- [ ] JWT tokens expire after 7 days
- [ ] Invalid tokens are rejected with 401
- [ ] Expired tokens are rejected with 401
- [ ] Users cannot access other users' data
- [ ] All task endpoints require authentication
- [ ] BETTER_AUTH_SECRET is not committed to git
- [ ] Error messages don't leak sensitive information
- [ ] Token signature is verified on every request

## Next Steps

Once all tests pass:

1. Mark tasks T048-T051 as complete in `tasks.md`
2. Create git commit with authentication implementation
3. Consider additional security enhancements:
   - Rate limiting on auth endpoints
   - Account lockout after failed attempts
   - Password reset functionality
   - Refresh token mechanism
   - Multi-factor authentication (MFA)
