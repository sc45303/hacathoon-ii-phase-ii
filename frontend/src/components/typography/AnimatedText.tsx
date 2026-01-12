'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * AnimatedText Component System
 *
 * Provides various text animation patterns for enhanced user experience.
 * All animations respect prefers-reduced-motion accessibility preference.
 *
 * Animation Types:
 * - FadeIn: Simple opacity fade
 * - SlideUp: Fade + slide from bottom
 * - CharacterStagger: Each character animates individually
 * - WordFade: Each word fades in sequentially
 */

interface AnimatedTextProps {
  children: string;
  className?: string;
  delay?: number;
  duration?: number;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

/**
 * FadeIn - Simple fade animation
 * Use for: Page titles, headers
 * Duration: 300ms (default)
 */
export const FadeIn: React.FC<AnimatedTextProps> = ({
  children,
  className,
  delay = 0,
  duration = 0.3,
  as: Component = 'div',
}) => {
  const prefersReducedMotion = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration,
        delay,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const MotionComponent = motion[Component];

  return (
    <MotionComponent
      className={className}
      initial={prefersReducedMotion ? false : 'hidden'}
      animate="visible"
      variants={prefersReducedMotion ? undefined : variants}
    >
      {children}
    </MotionComponent>
  );
};

/**
 * SlideUp - Fade + slide from bottom
 * Use for: Body text, descriptions
 * Duration: 300ms (default)
 */
export const SlideUp: React.FC<AnimatedTextProps> = ({
  children,
  className,
  delay = 0,
  duration = 0.3,
  as: Component = 'div',
}) => {
  const prefersReducedMotion = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const MotionComponent = motion[Component];

  return (
    <MotionComponent
      className={className}
      initial={prefersReducedMotion ? false : 'hidden'}
      animate="visible"
      variants={prefersReducedMotion ? undefined : variants}
    >
      {children}
    </MotionComponent>
  );
};

/**
 * CharacterStagger - Each character animates individually
 * Use for: Special headings, hero sections (use sparingly)
 * Duration: 20ms stagger per character
 */
export const CharacterStagger: React.FC<AnimatedTextProps> = ({
  children,
  className,
  delay = 0,
  duration = 0.5,
  as: Component = 'div',
}) => {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
        delayChildren: delay,
      },
    },
  };

  const childVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: duration / children.length,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const MotionComponent = motion[Component];

  if (prefersReducedMotion) {
    return <MotionComponent className={className}>{children}</MotionComponent>;
  }

  const characters = children.split('');

  return (
    <MotionComponent
      className={cn('inline-flex flex-wrap', className)}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      aria-label={children}
    >
      {characters.map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          variants={childVariants}
          className="inline-block"
          style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </MotionComponent>
  );
};

/**
 * WordFade - Each word fades in sequentially
 * Use for: Important messages, callouts
 * Duration: 50ms stagger per word
 */
export const WordFade: React.FC<AnimatedTextProps> = ({
  children,
  className,
  delay = 0,
  duration = 0.4,
  as: Component = 'div',
}) => {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: delay,
      },
    },
  };

  const childVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: duration / 2,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const MotionComponent = motion[Component];

  if (prefersReducedMotion) {
    return <MotionComponent className={className}>{children}</MotionComponent>;
  }

  const words = children.split(' ');

  return (
    <MotionComponent
      className={cn('inline-flex flex-wrap gap-x-[0.25em]', className)}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      aria-label={children}
    >
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          variants={childVariants}
          className="inline-block"
        >
          {word}
        </motion.span>
      ))}
    </MotionComponent>
  );
};

/**
 * TypeWriter - Typewriter effect
 * Use for: Special emphasis, loading states
 * Duration: Based on text length
 */
interface TypeWriterProps extends AnimatedTextProps {
  speed?: number; // characters per second
  cursor?: boolean;
}

export const TypeWriter: React.FC<TypeWriterProps> = ({
  children,
  className,
  delay = 0,
  speed = 30,
  cursor = false,
  as: Component = 'div',
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [displayedText, setDisplayedText] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayedText(children);
      return;
    }

    const timeout = setTimeout(() => {
      if (currentIndex < children.length) {
        setDisplayedText(children.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }
    }, delay * 1000 + (1000 / speed));

    return () => clearTimeout(timeout);
  }, [currentIndex, children, delay, speed, prefersReducedMotion]);

  const MotionComponent = motion[Component];

  return (
    <MotionComponent className={className}>
      {displayedText}
      {cursor && currentIndex < children.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          className="inline-block ml-0.5"
        >
          |
        </motion.span>
      )}
    </MotionComponent>
  );
};

/**
 * GradientText - Text with animated gradient
 * Use for: Hero titles, special emphasis
 */
interface GradientTextProps extends AnimatedTextProps {
  from?: string;
  via?: string;
  to?: string;
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  className,
  delay = 0,
  duration = 0.3,
  from = 'from-blue-600',
  via = 'via-purple-600',
  to = 'to-pink-600',
  as: Component = 'span',
}) => {
  const prefersReducedMotion = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const MotionComponent = motion[Component];

  return (
    <MotionComponent
      className={cn(
        'bg-gradient-to-r bg-clip-text text-transparent',
        from,
        via,
        to,
        className
      )}
      initial={prefersReducedMotion ? false : 'hidden'}
      animate="visible"
      variants={prefersReducedMotion ? undefined : variants}
    >
      {children}
    </MotionComponent>
  );
};
