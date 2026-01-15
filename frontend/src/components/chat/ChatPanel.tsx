'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { useChat } from '@/providers/ChatProvider';
import { X, Plus, PanelLeftClose, PanelLeft } from 'lucide-react';
import { ChatInterface } from './ChatInterface';
import { ConversationList } from './ConversationList';

interface ChatPanelProps {
  variant: 'modal' | 'sidebar' | 'slide-over' | 'fullscreen';
  onClose?: () => void;
}

/**
 * ChatPanel - Base component for all chat view modes
 *
 * This component provides the shared structure and behavior for:
 * - Modal (content pages on desktop)
 * - Sidebar (dashboard pages on desktop)
 * - Slide-over (dashboard pages on tablet)
 * - Fullscreen (all pages on mobile)
 *
 * Features:
 * - Keyboard shortcuts (ESC to close, Ctrl+N for new chat)
 * - Collapsible conversation list
 * - ChatGPT-style clean interface
 * - Error handling
 */
export function ChatPanel({ variant, onClose }: ChatPanelProps) {
  const { state, closeChat, loadConversations, createNewConversation } = useChat();
  const [userId, setUserId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isConversationListOpen, setIsConversationListOpen] = useState(true);

  // Get authentication details from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');

      setToken(storedToken);
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setUserId(user.id);
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          setUserId(null);
        }
      } else {
        setUserId(null);
      }
    }
  }, []);

  // Load conversations on mount
  useEffect(() => {
    if (userId && token) {
      loadConversations();
    }
  }, [userId, token, loadConversations]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // ESC to close
      if (event.key === 'Escape') {
        if (onClose) {
          onClose();
        } else {
          closeChat();
        }
      }

      // Ctrl+N or Cmd+N for new conversation
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        createNewConversation();
      }

      // Ctrl+B or Cmd+B to toggle conversation list
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        setIsConversationListOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, closeChat, createNewConversation]);

  // Handle close button click
  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      closeChat();
    }
  }, [onClose, closeChat]);

  // Handle new chat button click
  const handleNewChat = useCallback(() => {
    createNewConversation();
  }, [createNewConversation]);

  // Toggle conversation list
  const toggleConversationList = useCallback(() => {
    setIsConversationListOpen(prev => !prev);
  }, []);

  // Variant-specific styles
  const containerStyles = {
    modal: 'flex flex-col h-[700px] max-h-[80vh] w-full max-w-5xl bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden',
    sidebar: 'flex flex-col h-full w-[500px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800',
    'slide-over': 'flex flex-col h-full w-[90vw] max-w-lg bg-white dark:bg-gray-900 shadow-xl',
    fullscreen: 'flex flex-col h-[100dvh] w-full bg-white dark:bg-gray-900',
  };

  // Check if user is authenticated
  if (!userId || !token) {
    return (
      <div className={containerStyles[variant]}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Assistant
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Please sign in to use the AI assistant.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerStyles[variant]}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleConversationList}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={isConversationListOpen ? "Hide conversations" : "Show conversations"}
            title={`${isConversationListOpen ? 'Hide' : 'Show'} conversations (Ctrl+B)`}
          >
            {isConversationListOpen ? (
              <PanelLeftClose className="w-5 h-5" />
            ) : (
              <PanelLeft className="w-5 h-5" />
            )}
          </button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Assistant
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNewChat}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="New conversation"
            title="New conversation (Ctrl+N)"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close chat"
            title="Close chat (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation List Sidebar - Collapsible */}
        {isConversationListOpen && (
          <div className="w-64 border-r border-gray-200 dark:border-gray-800 flex-shrink-0 overflow-hidden bg-gray-50 dark:bg-gray-900/50">
            <ConversationList />
          </div>
        )}

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-900">
          <ChatInterface
            userId={userId}
            token={token}
            conversationId={state.activeConversationId || undefined}
          />
        </div>
      </div>
    </div>
  );
}
