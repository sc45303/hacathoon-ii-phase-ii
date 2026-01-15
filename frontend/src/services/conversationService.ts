/**
 * Conversation service for managing chat conversations.
 * Handles API calls to conversation endpoints.
 */

import { ChatMessage } from '@/types/chat';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Conversation {
  id: number;
  title: string | null;
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message_preview: string | null;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
}

export interface MessageResponse {
  id: number;
  role: string;
  content: string;
  timestamp: string;
  token_count: number | null;
}

export interface MessageListResponse {
  conversation_id: number;
  messages: MessageResponse[];
  total: number;
}

export interface UpdateConversationRequest {
  title: string;
}

export interface UpdateConversationResponse {
  id: number;
  title: string | null;
  updated_at: string;
}

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

/**
 * Get user ID from localStorage
 */
function getUserId(): number | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('auth_user');
  if (!userStr) return null;

  try {
    const user = JSON.parse(userStr);
    return user.id;
  } catch (error) {
    console.error('Failed to parse stored user data:', error);
    return null;
  }
}

/**
 * Handle API errors and convert to user-friendly messages
 */
async function handleApiError(response: Response): Promise<never> {
  let errorMessage = 'An unexpected error occurred';

  try {
    const errorData = await response.json();
    if (errorData.detail) {
      errorMessage = errorData.detail;
    } else if (errorData.error_code) {
      errorMessage = errorData.error_code;
    }
  } catch {
    // If JSON parsing fails, use status text
    errorMessage = response.statusText || errorMessage;
  }

  throw new Error(errorMessage);
}

/**
 * Get all conversations for the current user
 */
export async function getConversations(limit: number = 50): Promise<ConversationListResponse> {
  const token = getAuthToken();
  const userId = getUserId();

  if (!token || !userId) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/api/${userId}/conversations?limit=${limit}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

/**
 * Get messages for a specific conversation
 */
export async function getConversationMessages(
  conversationId: number,
  offset: number = 0,
  limit: number = 50
): Promise<MessageListResponse> {
  const token = getAuthToken();
  const userId = getUserId();

  if (!token || !userId) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${API_BASE_URL}/api/${userId}/conversations/${conversationId}/messages?offset=${offset}&limit=${limit}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

/**
 * Update a conversation's title
 */
export async function updateConversationTitle(
  conversationId: number,
  title: string
): Promise<UpdateConversationResponse> {
  const token = getAuthToken();
  const userId = getUserId();

  if (!token || !userId) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/api/${userId}/conversations/${conversationId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

/**
 * Delete a conversation
 */
export async function deleteConversation(conversationId: number): Promise<void> {
  const token = getAuthToken();
  const userId = getUserId();

  if (!token || !userId) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/api/${userId}/conversations/${conversationId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  // DELETE returns 204 No Content, so no JSON to parse
}

/**
 * Convert MessageResponse to ChatMessage format
 */
export function convertToChatMessage(message: MessageResponse): ChatMessage {
  return {
    id: message.id.toString(),
    role: message.role as 'user' | 'assistant',
    content: message.content,
    timestamp: new Date(message.timestamp),
  };
}
