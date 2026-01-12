'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Typography Component System
 *
 * A comprehensive set of typography components with consistent styling
 * and dark mode support.
 *
 * Features:
 * - Semantic HTML elements
 * - Dark mode support
 * - Customizable via className prop
 * - TypeScript typed
 *
 * For animated text, use the AnimatedText components from AnimatedText.tsx
 */

interface BaseTypographyProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * H1 - Page Titles
 * Usage: Main page headings, hero titles
 * Size: 24px (text-2xl)
 * Weight: Bold (font-bold)
 */
export const H1 = React.forwardRef<HTMLHeadingElement, BaseTypographyProps & React.HTMLAttributes<HTMLHeadingElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <h1
        ref={ref}
        className={cn(
          'text-2xl font-bold text-gray-900 dark:text-white leading-tight text-balance',
          className
        )}
        {...props}
      >
        {children}
      </h1>
    );
  }
);

H1.displayName = 'H1';

/**
 * H2 - Section Headers
 * Usage: Major section headings
 * Size: 18px (text-lg)
 * Weight: Semibold (font-semibold)
 */
export const H2 = React.forwardRef<HTMLHeadingElement, BaseTypographyProps & React.HTMLAttributes<HTMLHeadingElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={cn(
          'text-lg font-semibold text-gray-800 dark:text-gray-100 leading-snug text-balance',
          className
        )}
        {...props}
      >
        {children}
      </h2>
    );
  }
);

H2.displayName = 'H2';

/**
 * H3 - Subsection Headers
 * Usage: Subsection headings, card titles
 * Size: 16px (text-base)
 * Weight: Semibold (font-semibold)
 */
export const H3 = React.forwardRef<HTMLHeadingElement, BaseTypographyProps & React.HTMLAttributes<HTMLHeadingElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          'text-base font-semibold text-gray-700 dark:text-gray-200 leading-normal text-balance',
          className
        )}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

H3.displayName = 'H3';

/**
 * Body - Body Text
 * Usage: Paragraphs, main content text
 * Size: 14px (text-sm)
 * Weight: Normal (font-normal)
 */
export const Body = React.forwardRef<HTMLParagraphElement, BaseTypographyProps & React.HTMLAttributes<HTMLParagraphElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(
          'text-sm font-normal text-gray-600 dark:text-gray-400 leading-relaxed text-pretty',
          className
        )}
        {...props}
      >
        {children}
      </p>
    );
  }
);

Body.displayName = 'Body';

/**
 * Small - Small Text
 * Usage: Secondary information, captions
 * Size: 13px (text-[13px])
 * Weight: Normal (font-normal)
 */
export const Small = React.forwardRef<HTMLSpanElement, BaseTypographyProps & React.HTMLAttributes<HTMLSpanElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'text-[13px] font-normal text-gray-500 dark:text-gray-500 leading-normal',
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Small.displayName = 'Small';

/**
 * Tiny - Metadata Text
 * Usage: Timestamps, metadata, fine print
 * Size: 12px (text-xs)
 * Weight: Normal (font-normal)
 */
export const Tiny = React.forwardRef<HTMLSpanElement, BaseTypographyProps & React.HTMLAttributes<HTMLSpanElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'text-xs font-normal text-gray-400 dark:text-gray-600 leading-snug',
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Tiny.displayName = 'Tiny';

/**
 * Label - Form Labels
 * Usage: Input labels, form field labels
 * Size: 13px (text-[13px])
 * Weight: Medium (font-medium)
 */
export const Label = React.forwardRef<HTMLLabelElement, BaseTypographyProps & React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'text-[13px] font-medium text-gray-700 dark:text-gray-300 leading-normal',
          className
        )}
        {...props}
      >
        {children}
      </label>
    );
  }
);

Label.displayName = 'Label';

/**
 * ErrorText - Error Messages
 * Usage: Form validation errors, error states
 * Size: 12px (text-xs)
 * Weight: Medium (font-medium)
 */
export const ErrorText = React.forwardRef<HTMLSpanElement, BaseTypographyProps & React.HTMLAttributes<HTMLSpanElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'text-xs font-medium text-red-600 dark:text-red-400 leading-snug',
          className
        )}
        role="alert"
        {...props}
      >
        {children}
      </span>
    );
  }
);

ErrorText.displayName = 'ErrorText';

/**
 * HelperText - Helper Text
 * Usage: Form helper text, additional information
 * Size: 12px (text-xs)
 * Weight: Normal (font-normal)
 */
export const HelperText = React.forwardRef<HTMLSpanElement, BaseTypographyProps & React.HTMLAttributes<HTMLSpanElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'text-xs font-normal text-gray-500 dark:text-gray-500 leading-snug',
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

HelperText.displayName = 'HelperText';

