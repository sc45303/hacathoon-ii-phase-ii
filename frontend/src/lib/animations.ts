import { Variants, Transition } from 'framer-motion';

// ============================================================================
// ANIMATION CONSTANTS
// ============================================================================

export const ANIMATION_DURATION = {
  instant: 0.01,
  fast: 0.15,
  normal: 0.2,
  medium: 0.3,
  slow: 0.4,
} as const;

export const EASING = {
  easeOut: [0.0, 0.0, 0.2, 1],
  easeIn: [0.4, 0.0, 1, 1],
  easeInOut: [0.4, 0.0, 0.2, 1],
  spring: { type: 'spring', stiffness: 300, damping: 25 },
} as const;

// ============================================================================
// BASIC ANIMATIONS
// ============================================================================

// Fade in with slide up animation
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.medium,
      ease: EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.easeIn,
    },
  },
};

// Fade in animation
export const fadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.easeIn,
    },
  },
};

// Scale in animation
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.easeIn,
    },
  },
};

// Slide in from left
export const slideInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_DURATION.medium,
      ease: EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.easeIn,
    },
  },
};

// Slide in from right
export const slideInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_DURATION.medium,
      ease: EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.easeIn,
    },
  },
};

// ============================================================================
// STAGGER ANIMATIONS
// ============================================================================

// Stagger container for children animations
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

// Stagger item (use with staggerContainer)
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.medium,
      ease: EASING.easeOut,
    },
  },
};

// ============================================================================
// TASK-SPECIFIC ANIMATIONS
// ============================================================================

// Task item container animation
export const taskItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -10,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION.medium,
      ease: EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    scale: 0.95,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.easeIn,
    },
  },
};

// Task completion animation (for checkbox)
export const checkboxVariants: Variants = {
  unchecked: {
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION.fast,
    },
  },
  checked: {
    scale: [1, 1.2, 1],
    transition: {
      duration: ANIMATION_DURATION.medium,
      times: [0, 0.5, 1],
    },
  },
};

// Task title strikethrough animation
export const strikethroughVariants: Variants = {
  uncompleted: {
    opacity: 1,
    textDecoration: 'none',
    transition: {
      duration: ANIMATION_DURATION.fast,
    },
  },
  completed: {
    opacity: 0.6,
    textDecoration: 'line-through',
    transition: {
      duration: ANIMATION_DURATION.medium,
      delay: 0.1,
    },
  },
};

// Task hover animation
export const taskHoverVariants = {
  rest: {
    scale: 1,
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  },
  hover: {
    scale: 1.005,
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.easeOut,
    },
  },
};

// ============================================================================
// INLINE INPUT ANIMATIONS
// ============================================================================

// Inline task input expand animation
export const inlineInputVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.easeInOut,
    },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION.medium,
      ease: EASING.easeOut,
    },
  },
};

// Action buttons fade in
export const actionButtonsVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.normal,
      delay: 0.1,
    },
  },
};

// ============================================================================
// BUTTON ANIMATIONS
// ============================================================================

// Button interaction animation
export const buttonVariants = {
  rest: {
    scale: 1,
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.easeOut,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: EASING.easeIn,
    },
  },
};

// Scale on hover (legacy support)
export const scaleOnHover = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.easeInOut,
    },
  },
  tap: {
    scale: 0.95,
  },
};

// ============================================================================
// PAGE & MODAL ANIMATIONS
// ============================================================================

// Page transition
export const pageTransition: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.easeIn,
    },
  },
};

// Modal/Dialog backdrop animation
export const backdropVariants: Variants = {
  hidden: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
  },
  visible: {
    opacity: 1,
    backdropFilter: 'blur(4px)',
    transition: {
      duration: ANIMATION_DURATION.normal,
    },
  },
  exit: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
    transition: {
      duration: ANIMATION_DURATION.fast,
    },
  },
};

// Modal/Dialog content animation
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.easeIn,
    },
  },
};

// ============================================================================
// SIDEBAR & NAVIGATION ANIMATIONS
// ============================================================================

// Mobile menu slide in
export const mobileMenuVariants: Variants = {
  closed: {
    x: '-100%',
    transition: {
      duration: ANIMATION_DURATION.medium,
      ease: EASING.easeInOut,
    },
  },
  open: {
    x: 0,
    transition: {
      duration: ANIMATION_DURATION.medium,
      ease: EASING.easeOut,
    },
  },
};

// Sidebar navigation item animation
export const navItemVariants: Variants = {
  inactive: {
    x: 0,
    transition: {
      duration: ANIMATION_DURATION.fast,
    },
  },
  active: {
    x: 4,
    transition: {
      duration: ANIMATION_DURATION.fast,
    },
  },
};

// Overlay fade
export const overlayVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION.normal,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: ANIMATION_DURATION.fast,
    },
  },
};

// ============================================================================
// TOAST NOTIFICATION ANIMATIONS
// ============================================================================

// Toast slide in from top
export const toastVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -100,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION.medium,
      ease: EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -100,
    scale: 0.95,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.easeIn,
    },
  },
};

// Toast progress bar animation
export const toastProgressVariants: Variants = {
  initial: {
    scaleX: 1,
  },
  animate: {
    scaleX: 0,
    transition: {
      duration: 3,
      ease: 'linear',
    },
  },
};

// ============================================================================
// LOADING & SKELETON ANIMATIONS
// ============================================================================

// Pulse animation for loading states
export const pulseVariants: Variants = {
  pulse: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Shimmer animation for skeleton loading
export const shimmerVariants: Variants = {
  shimmer: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Bounce animation
export const bounce: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 15,
    },
  },
};

// Rotate in animation
export const rotateIn: Variants = {
  hidden: {
    opacity: 0,
    rotate: -10,
  },
  visible: {
    opacity: 1,
    rotate: 0,
    transition: {
      duration: ANIMATION_DURATION.medium,
      ease: EASING.easeOut,
    },
  },
};

// ============================================================================
// EMPTY STATE ANIMATIONS
// ============================================================================

// Empty state entrance animation
export const emptyStateVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Empty state icon animation
export const emptyStateIconVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION.medium,
      ease: EASING.easeOut,
    },
  },
};

// Empty state text animation
export const emptyStateTextVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.medium,
      ease: EASING.easeOut,
    },
  },
};
