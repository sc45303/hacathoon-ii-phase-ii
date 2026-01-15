/**
 * TypingIndicator component - Shows animated dots while AI is processing.
 */

'use client';

import React from 'react';

export function TypingIndicator() {
  return (
    <div className="flex items-center space-x-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg max-w-fit">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-400">AI is thinking...</span>
    </div>
  );
}
