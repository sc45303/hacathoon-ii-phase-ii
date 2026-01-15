/**
 * MessageList component - Displays conversation history with user and AI messages.
 * ChatGPT-style design with centered layout and alternating backgrounds.
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '@/types/chat';
import { User, Bot } from 'lucide-react';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading = false }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const formatTimestamp = (timestamp: string | Date) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex-1 overflow-y-auto" role="log" aria-live="polite" aria-label="Chat messages">
      {messages.length === 0 && !isLoading && (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 px-4">
          <div className="text-center max-w-md">
            <div className="mb-4 flex justify-center">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                <Bot className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
            <p className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">Start a conversation</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Send a message to begin chatting with your AI assistant</p>
          </div>
        </div>
      )}

      {messages.map((message, index) => (
        <div
          key={index}
          className={`py-6 px-4 ${
            message.role === 'assistant'
              ? 'bg-gray-50 dark:bg-gray-800/50'
              : 'bg-white dark:bg-gray-900'
          }`}
          role="article"
          aria-label={`${message.role === 'user' ? 'Your' : 'AI'} message`}
        >
          <div className="max-w-3xl mx-auto flex gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-green-600 text-white'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Bot className="w-5 h-5" />
                )}
              </div>
            </div>

            {/* Message Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {message.role === 'user' ? 'You' : 'AI Assistant'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words leading-relaxed">
                  {message.content}
                </p>
              </div>
              {message.token_count && (
                <div className="mt-2">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {message.token_count} tokens
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      <div ref={messagesEndRef} />
    </div>
  );
}
