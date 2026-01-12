"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
// import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { useIsDesktop, useIsTablet } from "@/hooks/useMediaQuery";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isTabletCollapsed, setIsTabletCollapsed] = useState(true);
  const isDesktop = useIsDesktop();
  const isTablet = useIsTablet();

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  const closeMobileNav = () => {
    setIsMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Skip Navigation Link - WCAG 2.4.1 Bypass Blocks */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-todoist-red focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      {/* Top Navbar */}

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar */}
        {isDesktop && (
          <div className="hidden md:block">
            <Sidebar />
          </div>
        )}

        {/* Tablet Sidebar (Collapsible) */}
        {isTablet && (
          <div
            className="hidden md:block relative"
            onMouseEnter={() => setIsTabletCollapsed(false)}
            onMouseLeave={() => setIsTabletCollapsed(true)}
          >
            <Sidebar isCollapsed={isTabletCollapsed} />
          </div>
        )}

        {/* Mobile Sidebar (Overlay) */}
        <MobileNav isOpen={isMobileNavOpen} onClose={closeMobileNav} />

        {/* Main Content Area */}
        <main id="main-content" className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
