'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { toastVariants, toastProgressVariants, fadeIn } from '@/lib/animations';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

/**
 * Toast notification component with animations
 *
 * Features:
 * - Slide in from top animation
 * - Auto-dismiss with progress bar
 * - Multiple types (success, error, info, warning)
 * - Manual dismiss option
 * - Respects reduced motion preferences
 *
 * @example
 * ```tsx
 * <Toast
 *   id="1"
 *   type="success"
 *   title="Task created"
 *   message="Your task has been created successfully"
 *   onClose={handleClose}
 * />
 * ```
 */
export function Toast({ id, type, title, message, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose(id), 200); // Wait for exit animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 200);
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
  };

  const styles = {
    success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    error: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
  };

  const progressColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={prefersReducedMotion ? fadeIn : toastVariants}
          className={`relative w-full max-w-sm rounded-lg border shadow-lg overflow-hidden ${styles[type]}`}
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {title}
                </p>
                {message && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {message}
                  </p>
                )}
              </div>
              <button
                onClick={handleClose}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Close notification"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {duration > 0 && !prefersReducedMotion && (
            <motion.div
              className={`h-1 ${progressColors[type]} origin-left`}
              initial="initial"
              animate="animate"
              variants={toastProgressVariants}
              style={{ scaleX: 1 }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * ToastContainer component to manage multiple toasts
 *
 * @example
 * ```tsx
 * <ToastContainer toasts={toasts} onClose={handleCloseToast} />
 * ```
 */
interface ToastContainerProps {
  toasts: ToastProps[];
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
}

export function ToastContainer({ toasts, position = 'top-right' }: ToastContainerProps) {
  const positionStyles = {
    'top-right': 'top-4 right-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <div className={`fixed ${positionStyles[position]} z-50 flex flex-col gap-2 pointer-events-none`}>
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
