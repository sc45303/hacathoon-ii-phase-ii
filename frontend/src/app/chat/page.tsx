/**
 * Chat page - Dedicated full-page chat interface.
 * Uses the unified ChatPanel component for consistency.
 */

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatPanel } from "@/components/chat/ChatPanel";

export default function ChatPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const checkAuth = () => {
      try {
        // Get token and user from localStorage
        const storedToken = localStorage.getItem("auth_token");
        const storedUser = localStorage.getItem("auth_user");

        if (!storedToken || !storedUser) {
          // Redirect to login if not authenticated
          router.push("/auth/signin");
          return;
        }

        // Parse user object to verify it's valid
        const user = JSON.parse(storedUser);

        if (!user || !user.id) {
          router.push("/auth/signin");
          return;
        }

        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/auth/signin");
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900">
      <ChatPanel variant="fullscreen" />
    </div>
  );
}
