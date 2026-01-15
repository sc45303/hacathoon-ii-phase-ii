import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { ChatProvider } from "@/providers/ChatProvider";
// import { ThemeProvider } from "@/components/theme/ThemeProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ChatGlobalWrapper } from "@/components/chat/ChatGlobalWrapper";
import Script from "next/script";

export const metadata: Metadata = {
  title: "TaskFlow - Organize Your Life",
  description:
    "Simple, powerful, and efficient task management. Stay focused, boost productivity, and achieve your goals.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme initialization script to prevent FOUC */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const THEME_STORAGE_KEY = 'todo-app-theme';
                function getStoredTheme() {
                  try {
                    const stored = localStorage.getItem(THEME_STORAGE_KEY);
                    if (stored === 'light' || stored === 'dark' || stored === 'system') {
                      return stored;
                    }
                  } catch (e) {}
                  return 'system';
                }
                function getSystemTheme() {
                  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                function resolveTheme(theme) {
                  return theme === 'system' ? getSystemTheme() : theme;
                }
                function applyTheme(theme) {
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                }
                const storedTheme = getStoredTheme();
                const resolvedTheme = resolveTheme(storedTheme);
                applyTheme(resolvedTheme);
              })();
            `,
          }}
        />
      </head>
      <body>
        {/* <ThemeProvider defaultTheme="system"> */}
        <AuthProvider>
          <ChatProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <div className="flex-1">{children}</div>
              <Footer />
            </div>
            <ChatGlobalWrapper />
          </ChatProvider>
        </AuthProvider>
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
