'use client';

import React from 'react';
import { Conversation } from '@/providers/ChatProvider';
import { MessageCircle, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

/**
 * ConversationListItem - Individual conversation item in the list
 *
 * Features:
 * - Shows conversation title
 * - Shows last message preview
 * - Shows message count
 * - Shows relative timestamp
 * - Highlights active conversation
 * - Delete button with hover state
 */
export function ConversationListItem({
  conversation,
  isActive,
  onClick,
  onDelete,
}: ConversationListItemProps) {
  // Format timestamp as relative time (e.g., "2 hours ago")
  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return '';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-3 rounded-lg transition-colors group
        ${
          isActive
            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
        }
      `}
      aria-label={`Switch to conversation: ${conversation.title || 'Untitled'}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          <MessageCircle
            className={`w-4 h-4 ${
              isActive
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-400 dark:text-gray-500'
            }`}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3
            className={`text-sm font-medium truncate ${
              isActive
                ? 'text-blue-900 dark:text-blue-100'
                : 'text-gray-900 dark:text-white'
            }`}
          >
            {conversation.title || 'New Conversation'}
          </h3>

          {/* Last message preview */}
          {conversation.last_message_preview && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
              {conversation.last_message_preview}
            </p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 dark:text-gray-500">
            <span>{conversation.message_count} messages</span>
            <span>•</span>
            <span>{formatTimestamp(conversation.updated_at)}</span>
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={onDelete}
          className="flex-shrink-0 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-opacity"
          aria-label="Delete conversation"
          title="Delete conversation"
        >
          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
        </button>
      </div>
    </button>
  );
}
