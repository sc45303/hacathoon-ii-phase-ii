'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useChat } from '@/providers/ChatProvider';
import { useChatViewMode } from '@/hooks/useChatViewMode';
import { ChatModal } from './ChatModal';
import { ChatSidebar } from './ChatSidebar';
import { ChatSlideOver } from './ChatSlideOver';
import { ChatFullscreen } from './ChatFullscreen';

/**
 * ChatRenderer - Route-aware container for chat UI
 *
 * Determines which chat wrapper to render based on:
 * - Current route (hides on /chat)
 * - View mode (modal, sidebar, slide-over, fullscreen)
 * - Chat open state
 *
 * View mode logic:
 * - Mobile (<768px): fullscreen
 * - Tablet (768-1024px): slide-over for dashboard, modal for content
 * - Desktop (>1024px): sidebar for dashboard, modal for content
 */
export function ChatRenderer() {
  const pathname = usePathname();
  const { state, setViewMode } = useChat();
  const viewMode = useChatViewMode();

  // Update view mode when it changes
  useEffect(() => {
    setViewMode(viewMode);
  }, [viewMode, setViewMode]);

  // Hide on /chat route (standalone page handles it)
  if (pathname === '/chat') {
    return null;
  }

  // Only render when chat is open
  if (!state.isOpen) {
    return null;
  }

  // Render appropriate wrapper based on view mode
  switch (state.viewMode) {
    case 'modal':
      return <ChatModal />;
    case 'sidebar':
      return <ChatSidebar />;
    case 'slide-over':
      return <ChatSlideOver />;
    case 'fullscreen':
      return <ChatFullscreen />;
    default:
      return null;
  }
}
