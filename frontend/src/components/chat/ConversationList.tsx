'use client';

import React, { useState } from 'react';
import { useChat } from '@/providers/ChatProvider';
import { ConversationListItem } from './ConversationListItem';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * ConversationList - List of all user conversations
 *
 * Features:
 * - Displays all conversations sorted by updated_at DESC
 * - Shows active conversation highlighted
 * - New chat button at top
 * - Delete confirmation
 * - Loading and empty states
 * - Scrollable list
 */
export function ConversationList() {
  const {
    state,
    createNewConversation,
    selectConversation,
    deleteConversation,
  } = useChat();

  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Handle conversation selection
  const handleSelectConversation = async (id: number) => {
    try {
      await selectConversation(id);
    } catch (error) {
      console.error('Failed to select conversation:', error);
      toast.error('Failed to load conversation');
    }
  };

  // Handle conversation deletion
  const handleDeleteConversation = async (
    e: React.MouseEvent,
    id: number
  ) => {
    e.stopPropagation(); // Prevent conversation selection

    // Simple confirmation
    if (!confirm('Delete this conversation? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteConversation(id);
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      toast.error('Failed to delete conversation');
    } finally {
      setDeletingId(null);
    }
  };

  // Loading state
  if (state.isLoadingConversations) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Conversations
          </h3>
          <button
            onClick={createNewConversation}
            className="p-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            aria-label="New conversation"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Loading skeleton */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading conversations...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (state.conversations.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Conversations
          </h3>
          <button
            onClick={createNewConversation}
            className="p-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            aria-label="New conversation"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Empty state */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-xs">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              No conversations yet. Start a new chat to get started!
            </p>
            <button
              onClick={createNewConversation}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Start New Chat
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Conversation list
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Conversations
        </h3>
        <button
          onClick={createNewConversation}
          className="p-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          aria-label="New conversation"
          title="New conversation (Ctrl+N)"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {state.conversations.map((conversation) => (
          <ConversationListItem
            key={conversation.id}
            conversation={conversation}
            isActive={state.activeConversationId === conversation.id}
            onClick={() => handleSelectConversation(conversation.id)}
            onDelete={(e) => handleDeleteConversation(e, conversation.id)}
          />
        ))}
      </div>

      {/* Footer with conversation count */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {state.conversations.length} conversation
          {state.conversations.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
