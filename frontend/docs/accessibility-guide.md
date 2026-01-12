# Accessibility Guide
**TaskFlow To-Do Application - Best Practices & Maintenance**

This guide provides best practices for maintaining and improving accessibility in the TaskFlow application.

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [Component Patterns](#component-patterns)
3. [Common Patterns and Anti-Patterns](#common-patterns-and-anti-patterns)
4. [Testing Guidelines](#testing-guidelines)
5. [Resources and Tools](#resources-and-tools)
6. [Maintenance Checklist](#maintenance-checklist)

---

## Core Principles

### 1. Semantic HTML First

Always use semantic HTML elements before reaching for ARIA attributes.

**Good:**
```tsx
<button onClick={handleClick}>Submit</button>
<nav>
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
  </ul>
</nav>
```

**Bad:**
```tsx
<div onClick={handleClick} role="button">Submit</div>
<div role="navigation">
  <div role="list">
    <div role="listitem"><span onClick={navigate}>Dashboard</span></div>
  </div>
</div>
```

### 2. Keyboard Accessibility

Every interactive element must be keyboard accessible.

**Requirements:**
- Tab/Shift+Tab to navigate
- Enter/Space to activate
- Escape to close modals/dialogs
- Arrow keys for lists/menus (optional but recommended)

**Implementation:**
```tsx
// Good: Native button is keyboard accessible
<button onClick={handleClick}>Click me</button>

// If using div, add keyboard support
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Click me
</div>
```

### 3. Focus Management

Manage focus appropriately, especially for dynamic content.

**When to manage focus:**
- Opening modals/dialogs
- Closing modals/dialogs
- Deleting items from lists
- Adding items to lists
- Page navigation

**Example:**
```tsx
// Focus first element in modal when opened
useEffect(() => {
  if (isOpen && firstElementRef.current) {
    firstElementRef.current.focus();
  }
}, [isOpen]);

// Return focus to trigger when closed
const handleClose = () => {
  setIsOpen(false);
  triggerRef.current?.focus();
};
```

### 4. Color Contrast

Maintain WCAG AA contrast ratios:
- Normal text: 4.5:1
- Large text (18pt+ or 14pt+ bold): 3:1
- UI components: 3:1

**Tools:**
- WebAIM Contrast Checker
- Chrome DevTools Accessibility Panel
- axe DevTools

### 5. Screen Reader Support

Ensure content is accessible to screen readers.

**Key practices:**
- Use proper heading hierarchy (h1 → h2 → h3)
- Associate labels with form inputs
- Provide alternative text for images
- Use ARIA live regions for dynamic content
- Add aria-label for icon-only buttons

---

## Component Patterns

### Buttons

**Icon-only buttons:**
```tsx
<button
  onClick={handleClick}
  aria-label="Delete task"
  className="..."
>
  <TrashIcon className="w-5 h-5" />
</button>
```

**Buttons with loading state:**
```tsx
<button
  onClick={handleSubmit}
  disabled={isLoading}
  aria-busy={isLoading}
>
  {isLoading ? (
    <>
      <Spinner aria-hidden="true" />
      <span>Loading...</span>
    </>
  ) : (
    'Submit'
  )}
</button>
```

### Form Inputs

**Accessible input with label:**
```tsx
<div>
  <label htmlFor="email" className="...">
    Email Address
    {required && <span className="text-error" aria-hidden="true">*</span>}
  </label>
  <input
    id="email"
    type="email"
    required={required}
    aria-invalid={error ? "true" : "false"}
    aria-describedby={error ? "email-error" : undefined}
    autoComplete="email"
  />
  {error && (
    <p id="email-error" role="alert" className="text-error">
      {error}
    </p>
  )}
</div>
```

**Floating label pattern (already implemented):**
```tsx
// See FloatingInput.tsx for full implementation
<FloatingInput
  id="email"
  type="email"
  label="Email Address"
  value={email}
  onChange={handleChange}
  error={emailError}
  required
  autoComplete="email"
/>
```

### Navigation

**Active navigation item:**
```tsx
<Link
  href="/dashboard"
  aria-current={isActive ? "page" : undefined}
  className={cn(
    "nav-item",
    isActive && "active"
  )}
>
  Dashboard
</Link>
```

**Skip navigation link:**
```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg"
>
  Skip to main content
</a>

<main id="main-content">
  {/* Main content */}
</main>
```

### Modals and Dialogs

**Accessible modal (using Radix UI):**
```tsx
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogTitle>Confirm Delete</DialogTitle>
    <p>Are you sure you want to delete this task?</p>
    <div>
      <button onClick={handleDelete}>Delete</button>
      <button onClick={() => setIsOpen(false)}>Cancel</button>
    </div>
  </DialogContent>
</Dialog>
```

**Custom modal with focus trap:**
```tsx
// See MobileNav.tsx for full implementation
const modalRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (!isOpen || !modalRef.current) return;

  const focusableElements = modalRef.current.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  firstElement?.focus();

  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  document.addEventListener('keydown', handleTab);
  return () => document.removeEventListener('keydown', handleTab);
}, [isOpen]);
```

### Lists

**Accessible task list:**
```tsx
<ul role="list" aria-label="Tasks">
  {tasks.map((task) => (
    <li key={task.id}>
      <TaskItem task={task} />
    </li>
  ))}
</ul>
```

### Live Regions

**Announcing dynamic changes:**
```tsx
const [announcement, setAnnouncement] = useState('');

// After task is added
setAnnouncement('Task added successfully');

// Clear after 3 seconds
setTimeout(() => setAnnouncement(''), 3000);

// In JSX
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {announcement}
</div>
```

**Live region politeness levels:**
- `aria-live="polite"` - Announces when user is idle (most common)
- `aria-live="assertive"` - Announces immediately (use sparingly, for critical alerts)
- `aria-live="off"` - No announcements (default)

---

## Common Patterns and Anti-Patterns

### ✅ Good Patterns

**1. Proper heading hierarchy:**
```tsx
<h1>Dashboard</h1>
<section>
  <h2>My Tasks</h2>
  <article>
    <h3>Task Title</h3>
  </article>
</section>
```

**2. Associated labels:**
```tsx
<label htmlFor="task-title">Task Title</label>
<input id="task-title" type="text" />
```

**3. Error messages with role="alert":**
```tsx
{error && (
  <div role="alert" className="error">
    {error}
  </div>
)}
```

**4. Loading states:**
```tsx
<button disabled={isLoading} aria-busy={isLoading}>
  {isLoading ? 'Loading...' : 'Submit'}
</button>
```

**5. Reduced motion support:**
```tsx
const prefersReducedMotion = useReducedMotion();

<motion.div
  variants={prefersReducedMotion ? fadeIn : complexAnimation}
>
  {content}
</motion.div>
```

### ❌ Anti-Patterns to Avoid

**1. Placeholder-only labels:**
```tsx
// Bad: No visible label
<input type="text" placeholder="Email" />

// Good: Visible label
<label htmlFor="email">Email</label>
<input id="email" type="text" placeholder="you@example.com" />
```

**2. Click handlers on non-interactive elements:**
```tsx
// Bad: Not keyboard accessible
<div onClick={handleClick}>Click me</div>

// Good: Use button
<button onClick={handleClick}>Click me</button>
```

**3. Color-only indicators:**
```tsx
// Bad: Relies only on color
<span className="text-red-500">Error</span>

// Good: Icon + text
<span className="text-red-500">
  <ErrorIcon aria-hidden="true" />
  Error: Invalid input
</span>
```

**4. Missing alt text:**
```tsx
// Bad: No alt text
<img src="/logo.png" />

// Good: Descriptive alt text
<img src="/logo.png" alt="TaskFlow logo" />

// Good: Decorative image
<img src="/decoration.png" alt="" aria-hidden="true" />
```

**5. Redundant ARIA:**
```tsx
// Bad: Redundant role
<button role="button">Click me</button>

// Good: Native semantics
<button>Click me</button>
```

**6. Inaccessible custom controls:**
```tsx
// Bad: Custom checkbox without accessibility
<div onClick={toggle} className={checked ? 'checked' : ''}>
  {checked && <CheckIcon />}
</div>

// Good: Use Radix UI or proper implementation
<Checkbox checked={checked} onCheckedChange={toggle} />
```

---

## Testing Guidelines

### Manual Testing

**1. Keyboard Navigation Test:**
- Unplug your mouse
- Navigate entire application using only keyboard
- Verify all functionality is accessible
- Check focus indicators are visible

**2. Screen Reader Test:**
- Install NVDA (Windows) or use VoiceOver (Mac)
- Navigate through application with screen reader
- Verify all content is announced correctly
- Check dynamic content announcements

**3. Color Contrast Test:**
- Use WebAIM Contrast Checker
- Test all text/background combinations
- Verify in both light and dark modes
- Check focus indicators

**4. Zoom Test:**
- Zoom browser to 200%
- Verify no horizontal scrolling
- Check all content remains accessible
- Test on mobile devices

### Automated Testing

**1. Lighthouse (Chrome DevTools):**
```bash
# Run Lighthouse audit
1. Open Chrome DevTools (F12)
2. Go to Lighthouse tab
3. Select "Accessibility" category
4. Click "Generate report"
5. Target: Score ≥ 90
```

**2. axe DevTools:**
```bash
# Install axe DevTools extension
1. Install from Chrome Web Store
2. Open DevTools
3. Go to axe DevTools tab
4. Click "Scan ALL of my page"
5. Fix all Critical and Serious issues
```

**3. WAVE:**
```bash
# Install WAVE extension
1. Install from browser extension store
2. Click WAVE icon on any page
3. Review errors and alerts
4. Fix all errors
```

### Continuous Integration

**Add accessibility tests to CI/CD:**
```json
// package.json
{
  "scripts": {
    "test:a11y": "pa11y-ci --config .pa11yci.json"
  }
}
```

```json
// .pa11yci.json
{
  "defaults": {
    "standard": "WCAG2AA",
    "timeout": 10000
  },
  "urls": [
    "http://localhost:3000/",
    "http://localhost:3000/dashboard",
    "http://localhost:3000/auth/signin"
  ]
}
```

---

## Resources and Tools

### Official Guidelines
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices**: https://www.w3.org/WAI/ARIA/apg/
- **MDN Accessibility**: https://developer.mozilla.org/en-US/docs/Web/Accessibility

### Testing Tools
- **axe DevTools**: https://www.deque.com/axe/devtools/
- **WAVE**: https://wave.webaim.org/extension/
- **Lighthouse**: Built into Chrome DevTools
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Pa11y**: https://pa11y.org/

### Screen Readers
- **NVDA** (Windows, Free): https://www.nvaccess.org/
- **JAWS** (Windows, Trial): https://www.freedomscientific.com/products/software/jaws/
- **VoiceOver** (macOS/iOS, Built-in): Cmd+F5 to enable

### Learning Resources
- **WebAIM**: https://webaim.org/
- **A11y Project**: https://www.a11yproject.com/
- **Inclusive Components**: https://inclusive-components.design/
- **Deque University**: https://dequeuniversity.com/

### Component Libraries
- **Radix UI**: https://www.radix-ui.com/ (Used in this project)
- **Headless UI**: https://headlessui.com/
- **React Aria**: https://react-spectrum.adobe.com/react-aria/

---

## Maintenance Checklist

### Before Each Release

- [ ] Run automated accessibility tests (axe, Lighthouse)
- [ ] Test keyboard navigation on all new/modified pages
- [ ] Verify color contrast in both light and dark modes
- [ ] Test with at least one screen reader
- [ ] Check focus indicators are visible
- [ ] Verify all forms are accessible
- [ ] Test on mobile devices

### Monthly

- [ ] Comprehensive screen reader testing
- [ ] Test on actual mobile devices (iOS and Android)
- [ ] Review and update accessibility documentation
- [ ] Check for new WCAG updates or best practices

### Quarterly

- [ ] Full accessibility audit
- [ ] User testing with people with disabilities
- [ ] Review and update accessibility statement
- [ ] Team training on accessibility best practices

### When Adding New Features

- [ ] Consider accessibility from the start
- [ ] Use semantic HTML
- [ ] Ensure keyboard accessibility
- [ ] Add ARIA labels where needed
- [ ] Test with screen reader
- [ ] Verify color contrast
- [ ] Add to accessibility testing checklist

### When Fixing Bugs

- [ ] Check if bug affects accessibility
- [ ] Test fix with keyboard only
- [ ] Test fix with screen reader
- [ ] Verify fix doesn't break existing accessibility
- [ ] Update tests if needed

---

## Quick Reference

### ARIA Roles (Use Sparingly)
- `role="button"` - Interactive element that triggers action
- `role="navigation"` - Navigation landmark
- `role="main"` - Main content landmark
- `role="dialog"` - Modal dialog
- `role="alert"` - Important message
- `role="status"` - Status update

### ARIA States and Properties
- `aria-label` - Accessible name for element
- `aria-labelledby` - References element(s) that label this element
- `aria-describedby` - References element(s) that describe this element
- `aria-invalid` - Indicates validation error
- `aria-required` - Indicates required field
- `aria-expanded` - Indicates expanded/collapsed state
- `aria-current` - Indicates current item in set
- `aria-live` - Announces dynamic content changes
- `aria-busy` - Indicates loading state
- `aria-modal` - Indicates modal dialog

### Keyboard Shortcuts
- **Tab** - Move focus forward
- **Shift+Tab** - Move focus backward
- **Enter** - Activate button/link
- **Space** - Activate button/checkbox
- **Escape** - Close modal/dialog
- **Arrow keys** - Navigate lists/menus

### Color Contrast Ratios
- **Normal text**: 4.5:1 (WCAG AA)
- **Large text** (18pt+ or 14pt+ bold): 3:1 (WCAG AA)
- **UI components**: 3:1 (WCAG AA)
- **Enhanced contrast** (AAA): 7:1 for normal text, 4.5:1 for large text

### Touch Target Sizes
- **Mobile**: 44x44px minimum (WCAG AAA)
- **Desktop**: 32x32px minimum (best practice)
- **Spacing**: 8px minimum between targets

---

## Getting Help

### Internal Resources
- Review this guide
- Check accessibility audit report
- Consult accessibility testing checklist
- Review component examples in codebase

### External Resources
- Post questions on Stack Overflow with `accessibility` tag
- Join WebAIM mailing list
- Consult WCAG documentation
- Use axe DevTools for specific issues

### Reporting Issues
When reporting accessibility issues, include:
1. WCAG criterion violated
2. Severity (Critical, High, Medium, Low)
3. Steps to reproduce
4. Expected vs. actual behavior
5. Screenshots/videos
6. Assistive technology used (if applicable)

---

**Last Updated:** 2026-01-10
**Maintained By:** Development Team
**Next Review:** Quarterly or after major releases
