'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, TaskUpdate } from '@/lib/types';
import { updateTask, patchTask, deleteTask } from '@/lib/api';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  taskItemVariants,
  checkboxVariants,
  strikethroughVariants,
  taskHoverVariants,
  buttonVariants,
  fadeIn,
} from '@/lib/animations';

interface TaskItemProps {
  task: Task;
  onTaskUpdated: () => void;
}

export default function TaskItem({ task, onTaskUpdated }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const handleToggleComplete = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await patchTask(task.id, { completed: !task.completed });
      onTaskUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      setError('Title is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const taskData: TaskUpdate = {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        completed: task.completed,
      };

      await updateTask(task.id, taskData);
      setIsEditing(false);
      onTaskUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setError(null);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await deleteTask(task.id);
      onTaskUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      setShowDeleteConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditing) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={prefersReducedMotion ? fadeIn : taskItemVariants}
        layout
        className="rounded-2xl p-6 bg-white/80 dark:bg-white/15 backdrop-blur-xl border-2 border-indigo-500/50 shadow-2xl"
      >
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-sm font-bold shadow-lg flex-shrink-0">
                  !
                </div>
                <p className="text-sm text-foreground font-semibold pt-1">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-5">
          <div>
            <label htmlFor={`edit-title-${task.id}`} className="block text-sm font-bold text-foreground mb-2">
              Title *
            </label>
            <input
              type="text"
              id={`edit-title-${task.id}`}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-4 py-3 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 dark:bg-white/5 backdrop-blur text-foreground shadow-md"
              maxLength={200}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor={`edit-description-${task.id}`} className="block text-sm font-bold text-foreground mb-2">
              Description
            </label>
            <textarea
              id={`edit-description-${task.id}`}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-4 py-3 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 dark:bg-white/5 backdrop-blur text-foreground resize-none shadow-md"
              rows={3}
              maxLength={1000}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3">
            <motion.button
              onClick={handleSaveEdit}
              disabled={isSubmitting}
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </motion.button>
            <motion.button
              onClick={handleCancelEdit}
              disabled={isSubmitting}
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              className="px-6 py-3 bg-white/50 dark:bg-white/5 backdrop-blur border border-white/20 text-foreground rounded-xl font-semibold hover:bg-white/70 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              Cancel
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={prefersReducedMotion ? fadeIn : taskItemVariants}
      layout
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              scale: 1.01,
              y: -2,
              boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
              transition: { duration: 0.2 },
            }
      }
      className={`rounded-2xl p-5 group backdrop-blur-xl border-2 shadow-lg transition-all duration-200 ${
        task.completed
          ? 'bg-emerald-500/10 dark:bg-emerald-500/5 border-emerald-300 dark:border-emerald-500/50'
          : 'bg-white/70 dark:bg-white/10 border-white/30 dark:border-white/20'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex items-center pt-1">
          <motion.div
            animate={task.completed ? "checked" : "unchecked"}
            variants={prefersReducedMotion ? undefined : checkboxVariants}
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={handleToggleComplete}
              disabled={isSubmitting}
              className="h-5 w-5 rounded-md border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 cursor-pointer transition-colors duration-200 hover:border-blue-500"
            />
          </motion.div>
        </div>

        <div className="flex-1 min-w-0">
          <motion.h3
            animate={task.completed ? "completed" : "uncompleted"}
            variants={prefersReducedMotion ? undefined : strikethroughVariants}
            className={`text-base font-medium mb-1 leading-relaxed truncate-2-lines ${
              task.completed
                ? 'text-gray-500 dark:text-gray-600 opacity-60'
                : 'text-gray-900 dark:text-white'
            }`}
          >
            {task.title}
          </motion.h3>
          {task.description && (
            <p className={`text-[13px] mb-3 leading-relaxed truncate-3-lines ${
              task.completed
                ? 'text-gray-400 dark:text-gray-700 opacity-60'
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center text-gray-500 dark:text-gray-500 leading-snug">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {new Date(task.created_at).toLocaleDateString()}
            </span>
            {task.updated_at !== task.created_at && (
              <span className="inline-flex items-center text-gray-500 dark:text-gray-500 leading-snug">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {new Date(task.updated_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <motion.div
          className="flex gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: prefersReducedMotion ? 1 : undefined }}
        >
          <motion.button
            onClick={() => setIsEditing(true)}
            disabled={isSubmitting}
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </span>
          </motion.button>
          <motion.button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isSubmitting}
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </span>
          </motion.button>
        </motion.div>
      </div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl backdrop-blur shadow-lg">
              <div className="flex items-start mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0 mr-4">
                  ⚠
                </div>
                <div>
                  <p className="text-base font-bold text-foreground mb-2">Delete Task?</p>
                  <p className="text-sm text-muted-foreground">
                    This action cannot be undone. The task will be permanently deleted.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <motion.button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  variants={buttonVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-xl font-bold hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </span>
                  ) : (
                    'Confirm Delete'
                  )}
                </motion.button>
                <motion.button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isSubmitting}
                  variants={buttonVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  className="px-6 py-3 bg-white/50 dark:bg-white/5 backdrop-blur border border-white/20 text-foreground rounded-xl font-semibold hover:bg-white/70 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-sm font-bold shadow-lg flex-shrink-0">
                  !
                </div>
                <p className="text-sm text-foreground font-semibold pt-1">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
