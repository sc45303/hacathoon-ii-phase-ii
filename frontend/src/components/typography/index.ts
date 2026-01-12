/**
 * Typography Components Index
 *
 * Centralized exports for all typography components.
 * Import from this file for cleaner imports throughout the application.
 *
 * @example
 * import { H1, H2, Body, Label } from '@/components/typography';
 * import { FadeIn, SlideUp } from '@/components/typography';
 * import { PageHeader } from '@/components/typography';
 */

// Base Typography Components
export {
  H1,
  H2,
  H3,
  Body,
  Small,
  Tiny,
  Label,
  ErrorText,
  HelperText,
} from './Typography';

// Animated Text Components
export {
  FadeIn,
  SlideUp,
  CharacterStagger,
  WordFade,
  TypeWriter,
  GradientText,
} from './AnimatedText';

// Page Header Components
export {
  PageHeader,
  SectionHeader,
} from './PageHeader';
