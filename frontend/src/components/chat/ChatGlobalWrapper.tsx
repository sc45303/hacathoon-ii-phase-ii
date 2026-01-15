'use client';

import React from 'react';
import { FloatingChatButton } from './FloatingChatButton';
import { ChatRenderer } from './ChatRenderer';

/**
 * ChatGlobalWrapper - Wrapper for global chat access components
 *
 * Combines:
 * - FloatingChatButton: Global chat access button (bottom-right)
 * - ChatRenderer: Context-aware chat UI (modal/sidebar/slide-over/fullscreen)
 *
 * This component should be added to the root layout to provide
 * global chat access across all pages.
 */
export function ChatGlobalWrapper() {
  return (
    <>
      <FloatingChatButton />
      <ChatRenderer />
    </>
  );
}
