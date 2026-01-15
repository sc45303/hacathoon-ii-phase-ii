/**
 * Chat service API client for interacting with the backend chat endpoint.
 */

import { ChatRequest, ChatResponse, ChatError } from '@/types/chat';
import { ErrorResponse, ApiError } from '@/types/error';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Parse error response from the API and throw structured ApiError.
 */
async function handleApiError(response: Response): Promise<never> {
  try {
    const errorData: ErrorResponse = await response.json();

    // Log technical details to console for debugging
    console.error('API Error:', {
      status: response.status,
      errorCode: errorData.error_code,
      detail: errorData.detail,
      source: errorData.source,
      provider: errorData.provider,
    });

    // Throw structured ApiError
    throw new ApiError(errorData, response.status);
  } catch (error) {
    // If parsing fails, throw generic error
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Failed to parse error response:', error);
    throw new Error(`HTTP error ${response.status}`);
  }
}

/**
 * Send a chat message to the AI assistant.
 *
 * @param userId - ID of the authenticated user
 * @param request - Chat request containing the message and optional parameters
 * @param token - JWT authentication token
 * @returns Promise resolving to the AI's response
 * @throws ApiError with structured error information if the request fails
 */
export async function sendChatMessage(
  userId: number,
  request: ChatRequest,
  token: string
): Promise<ChatResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/${userId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    const data: ChatResponse = await response.json();
    return data;
  } catch (error) {
    // Re-throw ApiError or network errors
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or parsing errors
    console.error('Network error in sendChatMessage:', error);
    throw new Error('Failed to send chat message. Please check your connection.');
  }
}

/**
 * Get conversation history for a specific conversation.
 *
 * @param userId - ID of the authenticated user
 * @param conversationId - ID of the conversation
 * @param token - JWT authentication token
 * @returns Promise resolving to the conversation data
 * @throws ApiError with structured error information if the request fails
 */
export async function getConversation(
  userId: number,
  conversationId: number,
  token: string
): Promise<any> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/${userId}/conversations/${conversationId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      await handleApiError(response);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Network error in getConversation:', error);
    throw new Error('Failed to fetch conversation. Please check your connection.');
  }
}

/**
 * Get all conversations for a user.
 *
 * @param userId - ID of the authenticated user
 * @param token - JWT authentication token
 * @returns Promise resolving to array of conversations
 * @throws ApiError with structured error information if the request fails
 */
export async function getUserConversations(
  userId: number,
  token: string
): Promise<any[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/${userId}/conversations`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      await handleApiError(response);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Network error in getUserConversations:', error);
    throw new Error('Failed to fetch conversations. Please check your connection.');
  }
}
