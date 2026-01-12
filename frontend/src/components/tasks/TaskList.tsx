'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTasks, TaskFilters } from '@/lib/api';
import { Task } from '@/lib/types';
import TaskItem from './TaskItem';
import {
  staggerContainer,
  fadeIn,
  emptyStateVariants,
  emptyStateIconVariants,
  emptyStateTextVariants,
  scaleIn
} from '@/lib/animations';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface TaskListProps {
  refreshTrigger?: number;
  filters?: TaskFilters;
}

export default function TaskList({ refreshTrigger = 0, filters }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const prefersReducedMotion = useReducedMotion();

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getTasks(filters);
      const previousCount = tasks.length;
      const newCount = response.tasks.length;

      setTasks(response.tasks);

      // Announce changes to screen readers
      if (newCount > previousCount) {
        setAnnouncement(`Task added. You now have ${newCount} ${newCount === 1 ? 'task' : 'tasks'}.`);
      } else if (newCount < previousCount) {
        setAnnouncement(`Task removed. You now have ${newCount} ${newCount === 1 ? 'task' : 'tasks'}.`);
      }

      // Clear announcement after 3 seconds
      setTimeout(() => setAnnouncement(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
      setAnnouncement('Error loading tasks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger, filters]);

  // Loading State with Premium Animation
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="rounded-3xl p-8 bg-white/70 dark:bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl"
      >
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative w-16 h-16">
            {/* Outer ring - slow rotation */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-white/30"
              animate={prefersReducedMotion ? {} : { rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            {/* Inner spinning gradient ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-purple-500 border-b-cyan-500 border-l-transparent"
              animate={prefersReducedMotion ? {} : { rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            {/* Center pulse dot */}
            <motion.div
              className="absolute top-1/2 left-1/2 w-3 h-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full"
              style={{ transform: 'translate(-50%, -50%)' }}
              animate={prefersReducedMotion ? {} : { scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="mt-6 text-foreground font-semibold text-lg"
          >
            Loading tasks...
          </motion.span>
        </div>
      </motion.div>
    );
  }

  // Error State with Premium Animation
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="rounded-3xl p-8 bg-white/70 dark:bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl backdrop-blur"
        >
          <div className="flex items-start">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, duration: 0.4, type: "spring", stiffness: 200 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0 mr-4"
            >
              ⚠
            </motion.div>
            <div className="flex-1">
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="text-foreground font-semibold mb-4"
              >
                {error}
              </motion.p>
              <motion.button
                onClick={fetchTasks}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-lg"
              >
                Try Again
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Empty State with Premium Animation
  if (tasks.length === 0) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={prefersReducedMotion ? fadeIn : emptyStateVariants}
        className="rounded-3xl p-8 bg-white/70 dark:bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl"
      >
        <div className="text-center py-16">
          <motion.div
            variants={prefersReducedMotion ? undefined : emptyStateIconVariants}
            whileHover={prefersReducedMotion ? undefined : {
              scale: 1.1,
              rotate: [0, -10, 10, -10, 0],
              transition: { duration: 0.5 }
            }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-xl"
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </motion.div>
          <motion.p
            variants={prefersReducedMotion ? undefined : emptyStateTextVariants}
            className="text-2xl font-bold text-foreground mb-3"
          >
            No tasks yet
          </motion.p>
          <motion.p
            variants={prefersReducedMotion ? undefined : emptyStateTextVariants}
            className="text-lg text-muted-foreground"
          >
            Create your first task to get started!
          </motion.p>
        </div>
      </motion.div>
    );
  }

  // Task List with Premium Animations
  return (
    <>
      {/* ARIA Live Region for Screen Reader Announcements - WCAG 4.1.3 */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={prefersReducedMotion ? fadeIn : staggerContainer}
        className="rounded-3xl p-8 bg-white/70 dark:bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:shadow-2xl transition-shadow duration-300"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={prefersReducedMotion ? undefined : {
                rotate: [0, -10, 10, -10, 0],
                transition: { duration: 0.5 }
              }}
              className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </motion.div>
            <h2 className="text-2xl font-bold text-foreground">My Tasks</h2>
          </div>
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={prefersReducedMotion ? undefined : {
              scale: 1.1,
              transition: { duration: 0.2 }
            }}
            className="inline-flex items-center px-4 py-2 rounded-xl text-base font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
          >
            {tasks.length}
          </motion.span>
        </motion.div>
        <motion.div
          variants={prefersReducedMotion ? undefined : staggerContainer}
          className="space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} onTaskUpdated={fetchTasks} />
            ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
}
