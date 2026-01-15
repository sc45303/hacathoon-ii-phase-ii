"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useChat } from "@/providers/ChatProvider";
import { useChatViewMode } from "@/hooks/useChatViewMode";
import { AppShell } from "@/components/layout/AppShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { session, isLoading } = useAuth();
  const { state, setViewMode } = useChat();
  const viewMode = useChatViewMode();

  // Update chat view mode when it changes
  useEffect(() => {
    setViewMode(viewMode);
  }, [viewMode, setViewMode]);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!isLoading && !session.token) {
      router.push("/auth/signin");
    }
  }, [isLoading, session.token, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-todoist-red"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Don't render content if not authenticated (will redirect)
  if (!session.token) {
    return null;
  }

  // Adjust layout when chat sidebar is open on desktop
  const shouldAdjustForSidebar = state.isOpen && state.viewMode === 'sidebar';

  return (
    <div
      className={`transition-all duration-300 ${
        shouldAdjustForSidebar ? 'mr-[400px]' : ''
      }`}
    >
      <AppShell>{children}</AppShell>
    </div>
  );
}
