"use client"

import * as React from "react"
import Link from "next/link"
import AnimatedBackground from "@/components/animations/AnimatedBackground"

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Premium Animated Background */}
      <AnimatedBackground variant="default" />

      {/* Header with Logo */}
      <header className="relative z-10 w-full py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-900 dark:text-white hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold">TaskFlow</span>
          </Link>

          {/* Theme toggle could go here */}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-gray-600 dark:text-gray-400">
            <Link
              href="/privacy"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/help"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Help Center
            </Link>
          </div>
          <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-500">
            &copy; {new Date().getFullYear()} TaskFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
