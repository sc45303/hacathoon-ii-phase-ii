# Task Manager - Frontend

Next.js 16+ frontend application with React 18+ for the Task Manager, featuring full CRUD operations, filtering, and sorting.

## Tech Stack

- **Next.js**: 16+ (App Router)
- **React**: 18+
- **TypeScript**: 5.x
- **Tailwind CSS**: 3.x (Styling)
- **API Integration**: Native Fetch API

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   └── tasks/
│   │       ├── TaskForm.tsx      # Create task form
│   │       ├── TaskItem.tsx      # Task display with edit/delete
│   │       ├── TaskList.tsx      # Task list container
│   │       └── TaskFilters.tsx   # Filter and sort controls
│   └── lib/
│       ├── api.ts            # API client functions
│       └── types.ts          # TypeScript interfaces
├── public/                   # Static assets
├── .env.local.example        # Environment template
├── next.config.js            # Next.js configuration
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000

# Authentication (REQUIRED)
BETTER_AUTH_SECRET=<same-secret-as-backend>
DATABASE_URL=<optional-for-better-auth-session-storage>
```

**Generate BETTER_AUTH_SECRET:**
```bash
# Use Python to generate a secure random secret
python -c "import secrets; print(secrets.token_urlsafe(32))"

# CRITICAL: Use the EXACT SAME secret in both backend/.env and frontend/.env.local
# The backend uses this to sign JWT tokens, frontend uses it to verify sessions
```

### 3. Start Development Server

```bash
npm run dev

# Application runs at http://localhost:3000
```

## Features

### Authentication ✅
- **Sign Up**: User registration with email/password validation
- **Sign In**: User authentication with JWT token issuance
- **Protected Routes**: Automatic redirect to signin for unauthenticated users
- **Session Management**: JWT token stored in localStorage with auto-initialization
- **Sign Out**: Clear session and redirect to signin
- **User Profile Display**: Show authenticated user's name/email in header

### User Story 1: View and Create Tasks ✅
- View all tasks in a responsive list
- Create new tasks with title and description
- Empty state when no tasks exist
- Real-time updates after task creation

### User Story 2: Update and Complete Tasks ✅
- Edit task title and description inline
- Toggle task completion with checkbox
- Visual distinction for completed tasks (strikethrough, green background)
- Cancel edit without saving changes

### User Story 3: Delete Tasks ✅
- Delete button on each task
- Confirmation dialog before deletion
- Immediate removal from list after deletion

### User Story 4: Filter and Sort Tasks ✅
- **Filter by Status**: All / Active / Completed
- **Sort Options**:
  - Newest First (created_at desc)
  - Oldest First (created_at asc)
  - Recently Updated (updated_at desc)
  - Least Recently Updated (updated_at asc)

## Component Architecture

### Authentication Components

#### SignUpForm (Client Component)
- Email and password input fields with validation
- Password strength requirements (min 8 chars, uppercase, lowercase, number)
- Email format validation (RFC 5322)
- Error handling for duplicate emails (409 Conflict)
- Calls `POST /api/auth/signup` endpoint
- Redirects to signin page after successful registration

#### SignInForm (Client Component)
- Email and password input fields
- Calls `POST /api/auth/signin` endpoint
- Stores JWT token and user profile in auth session
- Redirects to home page after successful authentication
- Error handling for invalid credentials (401 Unauthorized)

#### AuthProvider (Client Component)
- React Context provider for authentication state
- Manages session state (token, user, isLoading)
- Initializes session from localStorage on mount
- Provides `useAuth()` hook for accessing auth state
- Wraps entire application in layout.tsx

### Task Components

#### TaskForm (Client Component)
- Controlled form inputs
- Client-side validation
- Loading states during submission
- Error handling and display

### TaskItem (Client Component)
- Display mode with checkbox and edit/delete buttons
- Edit mode with inline form
- Confirmation dialog for deletion
- Optimistic UI updates

### TaskList (Client Component)
- Fetches tasks from API
- Loading spinner during fetch
- Error state display
- Empty state handling
- Accepts filters for dynamic updates

### TaskFilters (Client Component)
- Status filter dropdown (All/Active/Completed)
- Sort dropdown with 4 options
- Controlled inputs with state management

### Home Page (Client Component)
- Orchestrates all components
- Manages global state (filters, refresh trigger)
- Three-column responsive layout
- **Protected Route**: Redirects to signin if not authenticated
- Displays user profile in header with sign out button
- Shows loading state while checking authentication

## Authentication System

### Better Auth Configuration

The application uses a simplified Better Auth implementation with JWT token management:

**Location**: `src/lib/auth.ts`

```typescript
// Core authentication functions
auth(): Promise<AuthSession>           // Get current session
setAuthSession(token, user): void      // Store session after signin
clearAuthSession(): void               // Clear session on signout
initAuthSession(): void                // Initialize from localStorage
```

**Session Structure**:
```typescript
interface AuthSession {
  token: string | null;              // JWT token from backend
  user: {
    id: number;
    email: string;
    name: string;
  } | null;
}
```

**Storage**: Session data is stored in browser localStorage for persistence across page reloads.

### Authentication Flow

1. **User visits protected route** → AuthProvider checks for token
2. **No token found** → Redirect to `/auth/signin`
3. **User signs in** → Backend returns JWT token
4. **Token stored** → `setAuthSession()` saves to localStorage
5. **Subsequent requests** → Token included in `Authorization: Bearer` header
6. **Token expired/invalid** → API returns 401 → Redirect to signin

### Protected Routes

All routes except `/auth/signup` and `/auth/signin` require authentication:
- Home page (`/`) checks auth state and redirects if needed
- API client automatically includes JWT token in all requests
- 401 responses trigger automatic redirect to signin page

## API Integration

All API calls are in `src/lib/api.ts`:

### Authentication Endpoints

```typescript
// Note: Authentication is handled by form components
// SignUpForm calls POST /api/auth/signup
// SignInForm calls POST /api/auth/signin
```

### Task Endpoints (All require JWT authentication)

```typescript
// Fetch tasks with optional filters
getTasks(filters?: TaskFilters): Promise<TaskListResponse>

// Create new task
createTask(taskData: TaskCreate): Promise<Task>

// Update task (replace all fields)
updateTask(taskId: number, taskData: TaskUpdate): Promise<Task>

// Partially update task
patchTask(taskId: number, taskData: TaskPatch): Promise<Task>

// Delete task
deleteTask(taskId: number): Promise<void>
```

### Automatic JWT Token Injection

The `fetchAPI()` function automatically:
1. Retrieves JWT token from auth session
2. Includes `Authorization: Bearer <token>` header in all requests
3. Handles 401 Unauthorized responses by redirecting to signin
4. Throws `APIError` with status code and error details

## Styling

### Tailwind CSS Utilities
- Responsive breakpoints (sm, md, lg)
- Color palette (gray, blue, green, red, yellow)
- Spacing system (p-4, m-2, gap-6)
- Hover and focus states
- Transitions and animations

### Component Styling Patterns
- Cards: `rounded-lg shadow-md p-4`
- Buttons: `px-4 py-2 rounded-md hover:bg-*`
- Inputs: `border border-gray-300 rounded-md focus:ring-2`
- Status badges: Conditional classes based on state

## TypeScript Types

### Core Interfaces

```typescript
interface Task {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

interface TaskCreate {
  title: string;
  description?: string;
}

interface TaskUpdate {
  title: string;
  description?: string;
  completed: boolean;
}

interface TaskPatch {
  title?: string;
  description?: string;
  completed?: boolean;
}

interface TaskFilters {
  completed?: boolean | null;
  sort?: 'created_at' | 'updated_at';
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}
```

## Development

### Build for Production

```bash
npm run build
```

### Run Production Build

```bash
npm start
```

### Lint Code

```bash
npm run lint
```

## Responsive Design

### Breakpoints
- **Mobile**: Single column layout
- **Tablet (lg)**: Two columns (form + filters | tasks)
- **Desktop (lg)**: Three columns (form | filters | tasks)

### Mobile Optimizations
- Touch-friendly button sizes
- Stacked layout on small screens
- Readable font sizes
- Adequate spacing for touch targets

## Error Handling

### API Errors
- Network errors displayed in red alert boxes
- 404 errors show "Task not found"
- Validation errors show field-specific messages
- Retry mechanisms for failed requests

### User Feedback
- Loading spinners during async operations
- Success feedback via immediate UI updates
- Disabled buttons during submission
- Clear error messages with context

## Accessibility

- Semantic HTML elements
- Form labels for all inputs
- Keyboard navigation support
- Focus states on interactive elements
- ARIA attributes where needed
- Color contrast compliance

## Performance Optimizations

- Client-side state management
- Optimistic UI updates
- Debounced filter changes
- Minimal re-renders with React hooks
- Code splitting via Next.js App Router

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### API Connection Issues

1. Verify backend is running at `http://localhost:8000`
2. Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
3. Ensure CORS is configured in backend

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
# Check types
npm run type-check
```

## Next Steps

1. Add authentication UI (login/signup forms)
2. Implement protected routes
3. Add task categories/tags UI
4. Implement drag-and-drop reordering
5. Add dark mode toggle
6. Implement offline support with service workers
7. Add unit and integration tests
8. Deploy to Vercel

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables

Set in Vercel dashboard:
- `NEXT_PUBLIC_API_URL`: Your production API URL

## Contributing

1. Follow existing code style
2. Use TypeScript for type safety
3. Test all features before committing
4. Keep components small and focused
5. Document complex logic with comments
