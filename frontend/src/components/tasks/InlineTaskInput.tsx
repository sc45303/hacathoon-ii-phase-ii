'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { createTask } from '@/lib/api';
import { TaskCreate } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  inlineInputVariants,
  actionButtonsVariants,
  buttonVariants,
  fadeIn,
} from '@/lib/animations';

interface InlineTaskInputProps {
  onSubmit: () => void;
}

export function InlineTaskInput({ onSubmit }: InlineTaskInputProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const taskData: TaskCreate = {
        title: title.trim(),
        description: description.trim() || undefined,
      };

      await createTask(taskData);

      // Reset form
      setTitle('');
      setDescription('');
      setIsExpanded(false);

      // Notify parent to refresh task list
      onSubmit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setError(null);
    setIsExpanded(false);
  };

  // Auto-focus title input when expanded
  useEffect(() => {
    if (isExpanded && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isExpanded]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={prefersReducedMotion ? fadeIn : { hidden: { opacity: 0 }, visible: { opacity: 1 } }}
    >
      <form onSubmit={handleSubmit}>
        {/* Main Input */}
        <motion.div
          layout
          className={cn(
            'backdrop-blur-xl border transition-all duration-300 rounded-2xl overflow-hidden',
            isExpanded
              ? 'bg-white/80 dark:bg-white/15 border-indigo-500/50 shadow-2xl'
              : 'bg-white/60 dark:bg-white/10 border-white/20 shadow-lg hover:bg-white/70 dark:hover:bg-white/15 hover:shadow-xl'
          )}
        >
          <div className="flex items-center gap-4 px-5 py-4">
            <motion.div
              animate={isExpanded ? { rotate: 45, scale: 1.1 } : { rotate: 0, scale: 1 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0"
            >
              <Plus className="w-5 h-5 text-white" />
            </motion.div>
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              className="flex-1 bg-transparent text-base font-medium text-foreground placeholder-muted-foreground focus:outline-none"
              placeholder="Add a new task..."
              maxLength={200}
              disabled={isSubmitting}
            />
          </div>

          {/* Expanded Section */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                variants={prefersReducedMotion ? fadeIn : inlineInputVariants}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 space-y-4 border-t border-white/20 pt-4">
                  {/* Description */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                  >
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-white/50 dark:bg-white/5 backdrop-blur border border-white/20 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none shadow-md"
                      placeholder="Add description (optional)"
                      rows={3}
                      maxLength={1000}
                      disabled={isSubmitting}
                    />
                  </motion.div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-sm font-bold shadow-lg flex-shrink-0">
                            !
                          </div>
                          <p className="text-sm text-foreground font-medium pt-1">
                            {error}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Buttons */}
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={prefersReducedMotion ? fadeIn : actionButtonsVariants}
                    className="flex items-center justify-end gap-3"
                  >
                    <motion.button
                      type="button"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="px-5 py-2.5 text-sm font-semibold text-foreground bg-white/50 dark:bg-white/5 backdrop-blur border border-white/20 hover:bg-white/70 dark:hover:bg-white/10 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-md"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={isSubmitting || !title.trim()}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Adding...
                        </>
                      ) : (
                        'Add Task'
                      )}
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </form>
    </motion.div>
  );
}
