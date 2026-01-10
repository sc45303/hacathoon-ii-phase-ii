/**
 * Better Auth configuration for authentication
 *
 * Note: This is a simplified implementation that follows the JWT pattern
 * from the planning documents. Better Auth integration may require
 * additional configuration based on the actual package structure.
 */

// Type definitions for auth session
export interface AuthSession {
  token: string | null;
  user: {
    id: number;
    email: string;
    name: string;
  } | null;
}

// Simple auth state management
let currentSession: AuthSession = {
  token: null,
  user: null,
};

/**
 * Get current authentication session
 */
export async function auth(): Promise<AuthSession> {
  return currentSession;
}

/**
 * Set authentication session after successful login
 */
export function setAuthSession(token: string, user: { id: number; email: string; name: string }) {
  currentSession = {
    token,
    user,
  };

  // Store in localStorage for persistence
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  }
}

/**
 * Clear authentication session (logout)
 */
export function clearAuthSession() {
  currentSession = {
    token: null,
    user: null,
  };

  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
}

/**
 * Initialize auth session from localStorage on app start
 */
export function initAuthSession() {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        currentSession = { token, user };
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        clearAuthSession();
      }
    }
  }
}

// Initialize on module load
if (typeof window !== 'undefined') {
  initAuthSession();
}
