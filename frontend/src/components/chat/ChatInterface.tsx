/**
 * ChatInterface component - Main chat interface orchestrating all chat components.
 * Simplified for use within ChatPanel - no redundant headers.
 * Supports persistent chat history with conversation loading.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { ChatMessage, ChatRequest } from '@/types/chat';
import { sendChatMessage } from '@/services/chatService';
import { getConversationMessages, convertToChatMessage } from '@/services/conversationService';
import { ApiError } from '@/types/error';

interface ChatInterfaceProps {
  userId: number;
  token: string;
  conversationId?: number;
}

export function ChatInterface({ userId, token, conversationId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<number | undefined>(
    conversationId
  );

  // Load conversation history when conversationId changes
  useEffect(() => {
    const loadConversationHistory = async () => {
      if (!conversationId) {
        // New conversation - clear messages
        setMessages([]);
        setCurrentConversationId(undefined);
        return;
      }

      // Load existing conversation messages
      setIsLoadingHistory(true);
      setError(null);

      try {
        const response = await getConversationMessages(conversationId);
        const loadedMessages = response.messages.map(convertToChatMessage);
        setMessages(loadedMessages);
        setCurrentConversationId(conversationId);
      } catch (err) {
        console.error('Failed to load conversation history:', err);
        setError('Failed to load conversation history');
        setMessages([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadConversationHistory();
  }, [conversationId]);

  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    // Add user message to UI immediately
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`, // Temporary ID for optimistic update
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Prepare chat request
      const request: ChatRequest = {
        message: messageContent,
        conversation_id: currentConversationId,
        temperature: 0.7,
      };

      // Send message to backend
      const response = await sendChatMessage(userId, request, token);

      // Update conversation ID if this was a new conversation
      if (!currentConversationId) {
        setCurrentConversationId(response.conversation_id);
      }

      // Add AI response to messages
      const aiMessage: ChatMessage = {
        id: `${response.conversation_id}-${Date.now()}`, // Unique ID for the message
        role: 'assistant',
        content: response.message,
        timestamp: new Date(response.timestamp),
        token_count: response.token_count,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      // Handle structured API errors
      if (err instanceof ApiError) {
        // Log technical details to console for debugging
        console.error('API Error:', {
          errorCode: err.errorCode,
          source: err.source,
          provider: err.provider,
          statusCode: err.statusCode,
          detail: err.message,
        });

        // Get user-friendly message
        const userFriendlyMessage = err.getUserFriendlyMessage();
        setError(userFriendlyMessage);

        // Don't add error message to chat - only show in banner to avoid duplication
      } else {
        // Handle generic errors (network issues, etc.)
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMessage);
        console.error('Chat error:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Error banner */}
      {error && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 flex-shrink-0">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Loading history indicator */}
      {isLoadingHistory && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading conversation...</p>
          </div>
        </div>
      )}

      {/* Messages */}
      {!isLoadingHistory && <MessageList messages={messages} isLoading={isLoading} />}

      {/* Typing indicator */}
      {isLoading && (
        <div className="px-4 pb-2 flex-shrink-0">
          <TypingIndicator />
        </div>
      )}

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={isLoading || isLoadingHistory}
        placeholder="Message AI Assistant..."
      />
    </div>
  );
}
