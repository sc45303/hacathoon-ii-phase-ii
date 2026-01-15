'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { ChatMessage } from '@/types/chat';
import * as conversationService from '@/services/conversationService';
import { sendChatMessage } from '@/services/chatService';

// Types
export type ViewMode = 'modal' | 'sidebar' | 'slide-over' | 'fullscreen';

export interface Conversation {
  id: number;
  title: string | null;
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message_preview: string | null;
}

interface ChatState {
  // UI State
  isOpen: boolean;
  viewMode: ViewMode;

  // Data State
  conversations: Conversation[];
  activeConversationId: number | null;
  messages: Record<number, ChatMessage[]>; // Keyed by conversation ID for caching

  // Loading States
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  error: string | null;
}

type ChatAction =
  | { type: 'OPEN_CHAT' }
  | { type: 'CLOSE_CHAT' }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'SET_ACTIVE_CONVERSATION'; payload: number | null }
  | { type: 'SET_MESSAGES'; payload: { conversationId: number; messages: ChatMessage[] } }
  | { type: 'ADD_MESSAGE'; payload: { conversationId: number; message: ChatMessage } }
  | { type: 'UPDATE_MESSAGE'; payload: { conversationId: number; tempId: string; message: ChatMessage } }
  | { type: 'DELETE_CONVERSATION'; payload: number }
  | { type: 'UPDATE_CONVERSATION_TITLE'; payload: { conversationId: number; title: string } }
  | { type: 'SET_LOADING'; payload: { key: keyof Pick<ChatState, 'isLoadingConversations' | 'isLoadingMessages' | 'isSendingMessage'>; value: boolean } }
  | { type: 'SET_ERROR'; payload: string | null };

interface ChatContextValue {
  state: ChatState;

  // UI Actions
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  setViewMode: (mode: ViewMode) => void;

  // Conversation Management
  loadConversations: () => Promise<void>;
  createNewConversation: () => void;
  selectConversation: (id: number) => Promise<void>;
  deleteConversation: (id: number) => Promise<void>;
  updateConversationTitle: (id: number, title: string) => Promise<void>;

  // Messaging
  sendMessage: (message: string) => Promise<void>;
  retryMessage: (tempId: string) => Promise<void>;
}

// Initial state
const initialState: ChatState = {
  isOpen: false,
  viewMode: 'modal',
  conversations: [],
  activeConversationId: null,
  messages: {},
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSendingMessage: false,
  error: null,
};

// Reducer
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'OPEN_CHAT':
      return { ...state, isOpen: true };

    case 'CLOSE_CHAT':
      return { ...state, isOpen: false };

    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };

    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload };

    case 'SET_ACTIVE_CONVERSATION':
      return { ...state, activeConversationId: action.payload };

    case 'SET_MESSAGES':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.conversationId]: action.payload.messages,
        },
      };

    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.conversationId]: [
            ...(state.messages[action.payload.conversationId] || []),
            action.payload.message,
          ],
        },
      };

    case 'UPDATE_MESSAGE': {
      const conversationMessages = state.messages[action.payload.conversationId] || [];
      const updatedMessages = conversationMessages.map((msg) =>
        msg.id === action.payload.tempId ? action.payload.message : msg
      );
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.conversationId]: updatedMessages,
        },
      };
    }

    case 'DELETE_CONVERSATION': {
      const newMessages = { ...state.messages };
      delete newMessages[action.payload];
      return {
        ...state,
        conversations: state.conversations.filter((c) => c.id !== action.payload),
        activeConversationId: state.activeConversationId === action.payload ? null : state.activeConversationId,
        messages: newMessages,
      };
    }

    case 'UPDATE_CONVERSATION_TITLE':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.payload.conversationId
            ? { ...c, title: action.payload.title, updated_at: new Date().toISOString() }
            : c
        ),
      };

    case 'SET_LOADING':
      return { ...state, [action.payload.key]: action.payload.value };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

// Context
const ChatContext = createContext<ChatContextValue | undefined>(undefined);

// Provider Props
interface ChatProviderProps {
  children: React.ReactNode;
}

// Provider Component
export function ChatProvider({ children }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Load persisted state from localStorage on mount
  useEffect(() => {
    try {
      const persistedIsOpen = localStorage.getItem('chat_isOpen');
      const persistedActiveConversationId = localStorage.getItem('chat_activeConversationId');

      if (persistedIsOpen === 'true') {
        dispatch({ type: 'OPEN_CHAT' });
      }

      if (persistedActiveConversationId) {
        const conversationId = parseInt(persistedActiveConversationId, 10);
        if (!isNaN(conversationId)) {
          dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conversationId });
        }
      }
    } catch (error) {
      console.error('Failed to load persisted chat state:', error);
    }
  }, []);

  // Persist UI state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('chat_isOpen', state.isOpen.toString());
      if (state.activeConversationId !== null) {
        localStorage.setItem('chat_activeConversationId', state.activeConversationId.toString());
      } else {
        localStorage.removeItem('chat_activeConversationId');
      }
    } catch (error) {
      console.error('Failed to persist chat state:', error);
    }
  }, [state.isOpen, state.activeConversationId]);

  // UI Actions
  const openChat = useCallback(() => {
    dispatch({ type: 'OPEN_CHAT' });
  }, []);

  const closeChat = useCallback(() => {
    dispatch({ type: 'CLOSE_CHAT' });
  }, []);

  const toggleChat = useCallback(() => {
    dispatch({ type: state.isOpen ? 'CLOSE_CHAT' : 'OPEN_CHAT' });
  }, [state.isOpen]);

  const setViewMode = useCallback((mode: ViewMode) => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, []);

  // Conversation Management Actions
  const loadConversations = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'isLoadingConversations', value: true } });
    try {
      const response = await conversationService.getConversations();
      dispatch({ type: 'SET_CONVERSATIONS', payload: response.conversations });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Failed to load conversations:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load conversations';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'isLoadingConversations', value: false } });
    }
  }, []);

  const createNewConversation = useCallback(() => {
    // Clear active conversation to start a new one
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: null });
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const selectConversation = useCallback(async (id: number) => {
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: id });
    dispatch({ type: 'SET_LOADING', payload: { key: 'isLoadingMessages', value: true } });
    try {
      const response = await conversationService.getConversationMessages(id);
      const messages = response.messages.map(conversationService.convertToChatMessage);
      dispatch({ type: 'SET_MESSAGES', payload: { conversationId: id, messages } });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Failed to load messages:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load messages';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'isLoadingMessages', value: false } });
    }
  }, []);

  const deleteConversation = useCallback(async (id: number) => {
    try {
      await conversationService.deleteConversation(id);
      dispatch({ type: 'DELETE_CONVERSATION', payload: id });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete conversation';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error; // Re-throw so caller can handle (e.g., show toast)
    }
  }, []);

  const updateConversationTitle = useCallback(async (id: number, title: string) => {
    try {
      await conversationService.updateConversationTitle(id, title);
      dispatch({ type: 'UPDATE_CONVERSATION_TITLE', payload: { conversationId: id, title } });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Failed to update conversation title:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update title';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error; // Re-throw so caller can handle (e.g., show toast)
    }
  }, []);

  // Messaging Actions
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'Message cannot be empty' });
      return;
    }

    // Get authentication details from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null;
    let userId: number | null = null;
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userId = user.id;
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
      }
    }

    if (!token || !userId) {
      dispatch({ type: 'SET_ERROR', payload: 'Not authenticated' });
      return;
    }

    const conversationId = state.activeConversationId;

    // Generate temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`;

    // Create optimistic user message
    const optimisticUserMessage: ChatMessage = {
      id: tempId,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    // Add optimistic user message immediately
    if (conversationId) {
      dispatch({
        type: 'ADD_MESSAGE',
        payload: { conversationId, message: optimisticUserMessage }
      });
    }

    dispatch({ type: 'SET_LOADING', payload: { key: 'isSendingMessage', value: true } });

    try {
      // Prepare chat request
      const request = {
        message,
        conversation_id: conversationId || undefined,
        temperature: 0.7,
      };

      // Send message to backend
      const response = await sendChatMessage(userId, request, token);

      // If this was a new conversation, update active conversation ID
      if (!conversationId && response.conversation_id) {
        dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: response.conversation_id });

        // Reload conversations to get the new one in the list
        await loadConversations();
      }

      // Replace optimistic user message with server response (if conversation existed)
      if (conversationId) {
        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: {
            conversationId,
            tempId,
            message: {
              id: tempId, // Keep temp ID since we don't get user message ID back
              role: 'user',
              content: message,
              timestamp: new Date(),
            },
          },
        });
      }

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: `${response.conversation_id}-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date(response.timestamp),
      };

      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          conversationId: response.conversation_id,
          message: assistantMessage,
        },
      });

      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });

      // Mark the optimistic message as failed (we could add a 'failed' status to messages)
      // For now, we'll just leave it and let the user retry
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'isSendingMessage', value: false } });
    }
  }, [state.activeConversationId, loadConversations]);

  const retryMessage = useCallback(async (tempId: string) => {
    // Find the failed message
    const conversationId = state.activeConversationId;
    if (!conversationId) return;

    const messages = state.messages[conversationId] || [];
    const failedMessage = messages.find((msg) => msg.id === tempId);

    if (!failedMessage) {
      console.error('Failed message not found:', tempId);
      return;
    }

    // Retry by sending the message again
    await sendMessage(failedMessage.content);
  }, [state.activeConversationId, state.messages, sendMessage]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<ChatContextValue>(
    () => ({
      state,
      openChat,
      closeChat,
      toggleChat,
      setViewMode,
      loadConversations,
      createNewConversation,
      selectConversation,
      deleteConversation,
      updateConversationTitle,
      sendMessage,
      retryMessage,
    }),
    [
      state,
      openChat,
      closeChat,
      toggleChat,
      setViewMode,
      loadConversations,
      createNewConversation,
      selectConversation,
      deleteConversation,
      updateConversationTitle,
      sendMessage,
      retryMessage,
    ]
  );

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
}

// Custom hook to use chat context
export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
