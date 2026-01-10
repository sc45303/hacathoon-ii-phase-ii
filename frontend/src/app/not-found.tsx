"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { bounce } from "../lib/animations";
// import { bounce } from '@/lib/animations';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={bounce}
          className="space-y-8"
        >
          {/* 404 Icon */}
          <motion.div
            animate={{
              rotate: [0, -10, 10, -10, 0],
            }}
            transition={{
              duration: 0.5,
              delay: 0.5,
            }}
            className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-2xl"
          >
            <svg
              className="w-16 h-16 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </motion.div>

          {/* 404 Text */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-8xl sm:text-9xl font-bold text-gray-900 mb-4"
            >
              404
            </motion.h1>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4"
            >
              Page Not Found
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl text-gray-600 mb-8"
            >
              Oops! The page you're looking for seems to have wandered off.
              Let's get you back on track.
            </motion.p>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200"
            >
              Go Home
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-xl shadow-md hover:shadow-lg border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 transform hover:scale-105 transition-all duration-200"
            >
              Go to Dashboard
            </Link>
          </motion.div>

          {/* Helpful Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="pt-8"
          >
            <p className="text-sm text-gray-500 mb-4">Or try one of these:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/about"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                About
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                href="/auth/signin"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Sign In
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                href="/auth/signup"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
