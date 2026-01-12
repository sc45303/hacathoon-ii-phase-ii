"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Sidebar } from "./Sidebar";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const sidebarVariants = {
  closed: { x: "-100%" },
  open: { x: 0 },
};

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Prevent body scroll when mobile nav is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Focus trap - WCAG 2.4.3 Focus Order
  useEffect(() => {
    if (!isOpen || !sidebarRef.current) return;

    const sidebar = sidebarRef.current;
    const focusableElements = sidebar.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    // Focus close button when opened
    closeButtonRef.current?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleTabKey);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("keydown", handleTabKey);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          />

          {/* Sidebar Panel */}
          <motion.div
            ref={sidebarRef}
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="fixed top-0 left-0 bottom-0 w-[280px] shadow-2xl z-50 md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Close Button */}
            <div className="absolute top-4 right-4 z-10">
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-todoist-red transition-colors duration-200"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar Content */}
            <Sidebar onNavigate={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
