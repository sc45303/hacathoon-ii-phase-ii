# Typography Guide

## Overview

This guide documents the typography system for the Evolution of Todo application. Our typography is designed to create clear visual hierarchy, ensure readability, and provide a professional, polished user experience inspired by Todoist.

## Design Principles

1. **Clarity First**: Text should be immediately readable and scannable
2. **Consistent Hierarchy**: Clear distinction between heading levels and body text
3. **Accessibility**: All text meets WCAG AA contrast standards (4.5:1 for normal text, 3:1 for large text)
4. **Performance**: System fonts for zero loading time
5. **Responsive**: Text scales appropriately across all screen sizes

## Font System

### Font Stack

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
             'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
             'Helvetica Neue', sans-serif;
```

**Why System Fonts?**
- Zero network requests = instant loading
- Native look and feel on each platform
- Excellent readability optimized by OS vendors
- Consistent with platform conventions

### Font Features

All text includes these OpenType features:
- `kern` - Kerning for better letter spacing
- `liga` - Ligatures for improved readability
- `calt` - Contextual alternates

Applied via:
```css
font-feature-settings: 'kern' 1, 'liga' 1, 'calt' 1;
```

## Typography Scale

### Headings

#### H1 - Page Titles
- **Size**: 24px (text-2xl)
- **Weight**: Bold (700)
- **Line Height**: 1.25 (tight)
- **Color**: Gray-900 / White (dark mode)
- **Usage**: Main page headings, hero titles

```tsx
import { H1 } from '@/components/typography/Typography';

<H1>Dashboard</H1>
<H1 animate delay={0.1}>Welcome Back</H1>
```

#### H2 - Section Headers
- **Size**: 18px (text-lg)
- **Weight**: Semibold (600)
- **Line Height**: 1.375 (snug)
- **Color**: Gray-800 / Gray-100 (dark mode)
- **Usage**: Major section headings

```tsx
import { H2 } from '@/components/typography/Typography';

<H2>Today's Tasks</H2>
```

#### H3 - Subsection Headers
- **Size**: 16px (text-base)
- **Weight**: Semibold (600)
- **Line Height**: 1.5 (normal)
- **Color**: Gray-700 / Gray-200 (dark mode)
- **Usage**: Subsection headings, card titles

```tsx
import { H3 } from '@/components/typography/Typography';

<H3>Completed Tasks</H3>
```

### Body Text

#### Body - Paragraphs
- **Size**: 14px (text-sm)
- **Weight**: Normal (400)
- **Line Height**: 1.6 (relaxed)
- **Color**: Gray-600 / Gray-400 (dark mode)
- **Usage**: Paragraphs, main content text

```tsx
import { Body } from '@/components/typography/Typography';

<Body>This is a paragraph of body text.</Body>
```

#### Small - Secondary Text
- **Size**: 13px (text-[13px])
- **Weight**: Normal (400)
- **Line Height**: 1.5 (normal)
- **Color**: Gray-500 / Gray-500 (dark mode)
- **Usage**: Secondary information, captions

```tsx
import { Small } from '@/components/typography/Typography';

<Small>Last updated 2 hours ago</Small>
```

#### Tiny - Metadata
- **Size**: 12px (text-xs)
- **Weight**: Normal (400)
- **Line Height**: 1.375 (snug)
- **Color**: Gray-400 / Gray-600 (dark mode)
- **Usage**: Timestamps, metadata, fine print

```tsx
import { Tiny } from '@/components/typography/Typography';

<Tiny>Created on Jan 10, 2026</Tiny>
```

### Form Elements

#### Label - Form Labels
- **Size**: 13px (text-[13px])
- **Weight**: Medium (500)
- **Line Height**: 1.5 (normal)
- **Color**: Gray-700 / Gray-300 (dark mode)
- **Usage**: Input labels, form field labels

```tsx
import { Label } from '@/components/typography/Typography';

<Label htmlFor="email">Email Address</Label>
```

#### ErrorText - Error Messages
- **Size**: 12px (text-xs)
- **Weight**: Medium (500)
- **Line Height**: 1.375 (snug)
- **Color**: Red-600 / Red-400 (dark mode)
- **Usage**: Form validation errors

```tsx
import { ErrorText } from '@/components/typography/Typography';

<ErrorText>Email is required</ErrorText>
```

#### HelperText - Helper Text
- **Size**: 12px (text-xs)
- **Weight**: Normal (400)
- **Line Height**: 1.375 (snug)
- **Color**: Gray-500 / Gray-500 (dark mode)
- **Usage**: Form helper text, additional information

```tsx
import { HelperText } from '@/components/typography/Typography';

<HelperText>We'll never share your email</HelperText>
```

## Text Animations

### Available Animation Components

#### FadeIn
Simple opacity fade animation.

```tsx
import { FadeIn } from '@/components/typography/AnimatedText';

<FadeIn as="h1" delay={0.2}>
  Welcome to Todo
</FadeIn>
```

#### SlideUp
Fade + slide from bottom animation.

```tsx
import { SlideUp } from '@/components/typography/AnimatedText';

<SlideUp as="p" delay={0.3}>
  Get started with your first task
</SlideUp>
```

#### CharacterStagger
Each character animates individually (use sparingly).

```tsx
import { CharacterStagger } from '@/components/typography/AnimatedText';

<CharacterStagger as="h1" className="text-4xl font-bold">
  Amazing
</CharacterStagger>
```

#### WordFade
Each word fades in sequentially.

```tsx
import { WordFade } from '@/components/typography/AnimatedText';

<WordFade as="p" delay={0.5}>
  Your productivity starts here
</WordFade>
```

#### GradientText
Text with animated gradient.

```tsx
import { GradientText } from '@/components/typography/AnimatedText';

<GradientText
  as="h1"
  from="from-blue-600"
  via="via-purple-600"
  to="to-pink-600"
>
  Premium Feature
</GradientText>
```

### Animation Guidelines

1. **Respect Reduced Motion**: All animations automatically respect `prefers-reduced-motion`
2. **Keep It Subtle**: Animations should enhance, not distract (200-400ms duration)
3. **Stagger Delays**: Use 50-100ms delays between sequential animations
4. **Use Sparingly**: Not every text element needs animation

## Page Headers

### PageHeader Component

For consistent page titles with optional subtitle, icon, and action button.

```tsx
import { PageHeader } from '@/components/typography/PageHeader';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

<PageHeader
  title="Today"
  subtitle="3 tasks remaining"
  icon={Calendar}
  action={<Button>Add Task</Button>}
/>
```

### SectionHeader Component

For section headers within a page.

```tsx
import { SectionHeader } from '@/components/typography/PageHeader';

<SectionHeader
  title="Completed Tasks"
  subtitle="5 tasks completed today"
  action={<Button variant="ghost">Clear All</Button>}
/>
```

## Utility Classes

### Text Wrapping

```css
.text-balance  /* Balanced text wrapping for headings */
.text-pretty   /* Pretty text wrapping for body text */
```

### Line Clamping

```css
.truncate-2-lines  /* Truncate after 2 lines */
.truncate-3-lines  /* Truncate after 3 lines */
```

### Readability

```css
.max-w-readable      /* Max width: 65 characters */
.max-w-readable-wide /* Max width: 75 characters */
```

## Responsive Typography

### Mobile-First Approach

Always start with mobile sizes and scale up:

```tsx
<h1 className="text-2xl sm:text-3xl lg:text-4xl">
  Responsive Heading
</h1>
```

### Breakpoints

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## Accessibility Guidelines

### Contrast Ratios

All text meets WCAG AA standards:
- **Normal text** (< 18px): 4.5:1 minimum
- **Large text** (≥ 18px or ≥ 14px bold): 3:1 minimum

### Semantic HTML

Always use semantic HTML elements:
- `<h1>` to `<h6>` for headings (maintain hierarchy)
- `<p>` for paragraphs
- `<label>` for form labels
- `<span>` for inline text

### Screen Readers

- Use `aria-label` for icon-only buttons
- Use `role="alert"` for error messages
- Ensure heading hierarchy is logical (don't skip levels)

## Best Practices

### DO

✅ Use the Typography components for consistency
✅ Maintain clear visual hierarchy
✅ Keep line lengths between 50-75 characters
✅ Use appropriate line heights (1.5-1.6 for body text)
✅ Test with browser zoom up to 200%
✅ Respect reduced motion preferences

### DON'T

❌ Use pure black (#000) on pure white
❌ Set text smaller than 12px
❌ Use all caps for long text (reduces readability)
❌ Animate every text element
❌ Skip heading levels (h1 → h3)
❌ Use color alone to convey information

## Common Patterns

### Task Item Text

```tsx
// Task title
<h3 className="text-base font-medium text-gray-900 dark:text-white leading-relaxed truncate-2-lines">
  {task.title}
</h3>

// Task description
<p className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed truncate-3-lines">
  {task.description}
</p>

// Task metadata
<span className="text-xs text-gray-500 dark:text-gray-500 leading-snug">
  {task.createdAt}
</span>
```

### Navigation Text

```tsx
// Active navigation item
<span className="text-sm font-semibold text-todoist-red leading-normal">
  Today
</span>

// Inactive navigation item
<span className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-normal">
  Inbox
</span>

// Badge count
<span className="text-[11px] font-semibold tabular-nums leading-tight">
  5
</span>
```

### Button Text

```tsx
// Primary button
<button className="text-sm font-semibold tracking-wide">
  Get Started
</button>

// Secondary button
<button className="text-sm font-medium">
  Learn More
</button>
```

## Testing Checklist

Before deploying typography changes:

- [ ] Text readable at all viewport sizes (320px to 1920px)
- [ ] Contrast ratios meet WCAG AA standards
- [ ] Animations respect `prefers-reduced-motion`
- [ ] No layout shift during font loading
- [ ] Text scales properly with browser zoom (up to 200%)
- [ ] Semantic HTML hierarchy is correct
- [ ] Interactive text has hover/focus states
- [ ] No orphaned words in headings
- [ ] Consistent spacing throughout
- [ ] Performance: No jank during animations (60fps)

## Resources

- [WCAG Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Type Scale Calculator](https://typescale.com/)
- [System Font Stack](https://systemfontstack.com/)
- [Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## File Locations

- **Typography Components**: `frontend/src/components/typography/Typography.tsx`
- **Animated Text**: `frontend/src/components/typography/AnimatedText.tsx`
- **Page Headers**: `frontend/src/components/typography/PageHeader.tsx`
- **Global Styles**: `frontend/src/styles/globals.css`
- **This Guide**: `frontend/docs/typography-guide.md`

---

**Last Updated**: January 10, 2026
**Version**: 1.0.0
