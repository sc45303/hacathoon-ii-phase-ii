---
name: auth-skill
description: Implement secure authentication including signup, signin, password hashing, JWT tokens, and Better Auth integration.
---

# Authentication Skill

## Instructions

1. **User Signup**

   - Validate email and password
   - Hash passwords securely before storing
   - Prevent duplicate user registration
   - Store minimal required user data

2. **User Signin**

   - Verify user credentials
   - Compare hashed passwords
   - Handle invalid credentials gracefully
   - Return authentication tokens on success

3. **Password Security**

   - Use industry-standard hashing (bcrypt / argon2)
   - Never store plain-text passwords
   - Apply proper salt rounds
   - Follow OWASP password guidelines

4. **JWT Token Handling**

   - Generate access tokens on login
   - Include user ID and roles in payload
   - Set token expiration
   - Verify JWT for protected routes

5. **Better Auth Integration**
   - Configure Better Auth provider
   - Sync user sessions
   - Handle token refresh
   - Support logout and session invalidation

## Best Practices

- Always hash passwords
- Use HTTPS-only cookies for tokens
- Keep JWT expiration short
- Separate auth logic from business logic
- Add rate limiting on auth endpoints
- Log auth events (without sensitive data)

## Example Structure

```python
# signup
@router.post("/signup")
def signup(user: UserCreate):
    hashed_password = hash_password(user.password)
    save_user(user.email, hashed_password)
    return {"message": "User created successfully"}

# signin
@router.post("/signin")
def signin(credentials: LoginSchema):
    user = authenticate_user(credentials)
    token = create_jwt(user.id)
    return {"access_token": token, "token_type": "bearer"}

# protected route
@router.get("/profile")
def profile(current_user=Depends(get_current_user)):
    return current_user
```
