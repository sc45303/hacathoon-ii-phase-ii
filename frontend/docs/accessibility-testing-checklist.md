# Accessibility Testing Checklist
**TaskFlow To-Do Application**

Use this checklist to verify accessibility compliance before each release.

---

## 1. Keyboard Navigation Testing

### General Navigation
- [ ] Tab key moves focus through all interactive elements in logical order
- [ ] Shift+Tab moves focus backward through interactive elements
- [ ] Focus indicators are visible on all interactive elements
- [ ] Focus indicators have at least 3:1 contrast ratio with background
- [ ] No keyboard traps (can always move focus away from any element)
- [ ] Skip navigation link appears on first Tab press
- [ ] Skip navigation link navigates to main content

### Dashboard Pages (Inbox, Today, Upcoming)
- [ ] Can navigate through all task items with Tab
- [ ] Can activate task checkboxes with Space
- [ ] Can open task edit mode with Enter
- [ ] Can save task edits with Enter or Tab to Save button
- [ ] Can cancel task edits with Escape
- [ ] Can delete tasks using keyboard
- [ ] Can navigate through delete confirmation dialog

### Sidebar Navigation
- [ ] Can navigate through all navigation items with Tab
- [ ] Enter or Space activates navigation links
- [ ] Active page is indicated with aria-current="page"
- [ ] Can sign out using keyboard

### Mobile Navigation
- [ ] Can open mobile menu with Enter/Space on hamburger button
- [ ] Focus is trapped inside mobile menu when open
- [ ] Tab cycles through menu items only
- [ ] Escape key closes mobile menu
- [ ] Focus returns to hamburger button when menu closes

### Forms (Sign In, Sign Up)
- [ ] Can navigate through all form fields with Tab
- [ ] Can toggle password visibility with keyboard
- [ ] Can check/uncheck checkboxes with Space
- [ ] Enter key submits form
- [ ] Error messages receive focus when displayed

### Task Creation
- [ ] Can focus inline task input with Tab
- [ ] Can expand task input with Enter
- [ ] Can navigate through expanded fields with Tab
- [ ] Can submit task with Enter or Tab to Add button
- [ ] Can cancel with Escape

---

## 2. Screen Reader Testing

### Test with Multiple Screen Readers
- [ ] NVDA (Windows) - Free
- [ ] JAWS (Windows) - Trial available
- [ ] VoiceOver (macOS/iOS) - Built-in

### Semantic HTML
- [ ] Page has proper heading hierarchy (h1 → h2 → h3)
- [ ] Landmarks are announced (navigation, main, aside)
- [ ] Lists are announced as lists with item counts
- [ ] Forms use proper form elements
- [ ] Buttons are announced as buttons
- [ ] Links are announced as links

### ARIA Labels and Descriptions
- [ ] Icon-only buttons have aria-label or sr-only text
- [ ] Form inputs have associated labels
- [ ] Error messages are associated with inputs (aria-describedby)
- [ ] Loading states are announced (aria-live)
- [ ] Modal dialogs have aria-modal="true"
- [ ] Active navigation has aria-current="page"

### Dynamic Content Announcements
- [ ] Task additions are announced
- [ ] Task completions are announced
- [ ] Task deletions are announced
- [ ] Error messages are announced with role="alert"
- [ ] Success messages are announced
- [ ] Loading states are announced

### Form Accessibility
- [ ] Required fields are announced
- [ ] Field types are announced correctly (email, password, text)
- [ ] Error messages are announced when validation fails
- [ ] Success states are announced
- [ ] Autocomplete attributes work correctly

---

## 3. Color Contrast Testing

### Tools to Use
- [ ] WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- [ ] Chrome DevTools Accessibility Panel
- [ ] axe DevTools browser extension

### Light Mode Contrast Ratios
- [ ] Body text on background: ≥ 4.5:1
- [ ] Headings on background: ≥ 4.5:1 (or 3:1 if 18pt+)
- [ ] Button text on button background: ≥ 4.5:1
- [ ] Link text on background: ≥ 4.5:1
- [ ] Placeholder text on input background: ≥ 4.5:1
- [ ] Error text on background: ≥ 4.5:1
- [ ] Success text on background: ≥ 4.5:1
- [ ] Focus indicators: ≥ 3:1 with background

### Dark Mode Contrast Ratios
- [ ] Body text on background: ≥ 4.5:1
- [ ] Headings on background: ≥ 4.5:1 (or 3:1 if 18pt+)
- [ ] Button text on button background: ≥ 4.5:1
- [ ] Link text on background: ≥ 4.5:1
- [ ] Placeholder text on input background: ≥ 4.5:1
- [ ] Error text on background: ≥ 4.5:1
- [ ] Success text on background: ≥ 4.5:1
- [ ] Focus indicators: ≥ 3:1 with background

### UI Components
- [ ] Disabled buttons maintain 3:1 contrast (best practice)
- [ ] Hover states maintain contrast ratios
- [ ] Active states maintain contrast ratios
- [ ] Selected states maintain contrast ratios

---

## 4. Touch Target Size Testing

### Mobile Devices (<768px)
- [ ] All buttons are at least 44x44px
- [ ] All links are at least 44x44px
- [ ] Checkboxes have at least 44x44px clickable area
- [ ] Form inputs are at least 44px height
- [ ] Adequate spacing between touch targets (8px minimum)
- [ ] Theme toggle button is at least 44x44px

### Desktop
- [ ] Buttons are at least 32x32px
- [ ] Links have adequate click area
- [ ] Hover states don't require precision

### Test on Actual Devices
- [ ] iPhone (Safari)
- [ ] Android phone (Chrome)
- [ ] iPad (Safari)
- [ ] Android tablet (Chrome)

---

## 5. Motion and Animation Testing

### Reduced Motion Preference
- [ ] Set OS to prefer reduced motion
- [ ] Verify animations are disabled or simplified
- [ ] Essential motion still works (page transitions)
- [ ] No motion-triggered discomfort

### Animation Performance
- [ ] Animations run at 60fps on mid-range devices
- [ ] No janky or stuttering animations
- [ ] Animations don't block user interaction
- [ ] Loading states are clear during animations

### Test Devices
- [ ] High-end device (smooth performance)
- [ ] Mid-range device (acceptable performance)
- [ ] Low-end device (graceful degradation)

---

## 6. Focus Management Testing

### Modal Dialogs
- [ ] Focus is trapped inside modal when open
- [ ] Tab cycles through modal elements only
- [ ] Shift+Tab works correctly in reverse
- [ ] Escape key closes modal
- [ ] Focus returns to trigger element on close
- [ ] First focusable element receives focus on open

### Mobile Navigation
- [ ] Focus is trapped inside mobile menu when open
- [ ] Tab cycles through menu items only
- [ ] Escape key closes menu
- [ ] Focus returns to hamburger button on close

### Dynamic Content
- [ ] Focus is managed when content is added
- [ ] Focus is managed when content is removed
- [ ] Focus moves to next task after deletion
- [ ] Focus moves to "Add task" button if last task deleted
- [ ] Focus is never lost during interactions

---

## 7. Form Validation Testing

### Error Identification
- [ ] Errors are clearly identified
- [ ] Errors are associated with inputs (aria-describedby)
- [ ] Errors have role="alert" for announcement
- [ ] Error messages are clear and actionable
- [ ] Errors don't rely on color alone

### Required Fields
- [ ] Required fields have visual indicator (*)
- [ ] Required fields are announced by screen readers
- [ ] Form legend explains required field indicator
- [ ] HTML5 required attribute is used

### Real-time Validation
- [ ] Validation doesn't interrupt typing
- [ ] Validation messages are helpful
- [ ] Success states are indicated
- [ ] Password strength is announced

---

## 8. Responsive Design Testing

### Breakpoints
- [ ] Mobile (<768px): Layout is functional
- [ ] Tablet (768-1023px): Layout is functional
- [ ] Desktop (≥1024px): Layout is functional
- [ ] No horizontal scrolling at any breakpoint
- [ ] Content reflows appropriately

### Mobile Specific
- [ ] Touch targets are adequate size
- [ ] Text is readable without zooming
- [ ] Forms are usable on mobile
- [ ] Navigation is accessible on mobile
- [ ] Sidebar collapses to mobile menu

### Zoom Testing
- [ ] Text can be resized to 200% without loss of functionality
- [ ] No horizontal scrolling at 200% zoom
- [ ] All content remains accessible at 200% zoom

---

## 9. Content Readability Testing

### Typography
- [ ] Font size is at least 14px for body text
- [ ] Line height is at least 1.5 for body text
- [ ] Line length is 65-75 characters maximum
- [ ] Adequate spacing between paragraphs
- [ ] Text can be resized to 200%

### Language and Clarity
- [ ] Language is clear and concise
- [ ] No jargon or complex terms
- [ ] Error messages are actionable
- [ ] Instructions are clear and helpful
- [ ] Success messages are encouraging

---

## 10. Automated Testing

### Tools to Run
- [ ] axe DevTools browser extension
- [ ] Lighthouse accessibility audit (Chrome DevTools)
- [ ] WAVE browser extension
- [ ] Pa11y CLI tool (if available)

### Lighthouse Scores
- [ ] Accessibility score: ≥ 90
- [ ] Performance score: ≥ 80
- [ ] Best Practices score: ≥ 90
- [ ] SEO score: ≥ 90

### axe DevTools
- [ ] No critical issues
- [ ] No serious issues
- [ ] Moderate issues documented and prioritized
- [ ] Minor issues documented for future fixes

---

## 11. Browser Testing

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] Safari on iOS
- [ ] Chrome on Android
- [ ] Firefox on Android
- [ ] Samsung Internet

---

## 12. Assistive Technology Testing

### Screen Readers
- [ ] NVDA + Chrome (Windows)
- [ ] NVDA + Firefox (Windows)
- [ ] JAWS + Chrome (Windows)
- [ ] VoiceOver + Safari (macOS)
- [ ] VoiceOver + Safari (iOS)
- [ ] TalkBack + Chrome (Android)

### Other Assistive Technologies
- [ ] Voice control (Dragon NaturallySpeaking, Voice Control)
- [ ] Switch control (iOS/Android)
- [ ] Magnification tools (ZoomText, built-in magnifiers)

---

## 13. Error Prevention and Recovery

### Destructive Actions
- [ ] Delete actions require confirmation
- [ ] Confirmation dialogs are clear
- [ ] Cancel button is available
- [ ] Undo functionality (if applicable)

### Form Submission
- [ ] Form data is preserved on error
- [ ] Clear error messages with recovery steps
- [ ] Ability to correct errors easily
- [ ] Confirmation before leaving unsaved changes

---

## 14. Documentation Review

### Accessibility Documentation
- [ ] Accessibility statement is available
- [ ] Known issues are documented
- [ ] Workarounds are provided for known issues
- [ ] Contact information for accessibility feedback

### User Documentation
- [ ] Keyboard shortcuts are documented
- [ ] Screen reader instructions are provided
- [ ] Accessibility features are highlighted

---

## Testing Frequency

### Before Each Release
- [ ] Run automated tests (axe, Lighthouse, WAVE)
- [ ] Test keyboard navigation on all pages
- [ ] Verify color contrast in both themes
- [ ] Test with at least one screen reader

### Monthly
- [ ] Comprehensive screen reader testing
- [ ] Test on actual mobile devices
- [ ] Review and update documentation

### Quarterly
- [ ] Full accessibility audit
- [ ] User testing with people with disabilities
- [ ] Review WCAG updates and new best practices

---

## Issue Tracking

### When Issues Are Found
1. Document the issue with:
   - WCAG criterion violated
   - Severity (Critical, High, Medium, Low)
   - Steps to reproduce
   - Expected vs. actual behavior
   - Screenshots/videos if applicable

2. Prioritize based on:
   - Impact on users
   - WCAG level (A, AA, AAA)
   - Frequency of occurrence
   - Ease of fix

3. Track in issue tracker with:
   - Accessibility label
   - WCAG criterion tag
   - Severity label
   - Assigned developer

---

## Resources

### Testing Tools
- **axe DevTools**: https://www.deque.com/axe/devtools/
- **WAVE**: https://wave.webaim.org/extension/
- **Lighthouse**: Built into Chrome DevTools
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Pa11y**: https://pa11y.org/

### Screen Readers
- **NVDA**: https://www.nvaccess.org/ (Free)
- **JAWS**: https://www.freedomscientific.com/products/software/jaws/ (Trial)
- **VoiceOver**: Built into macOS/iOS

### Guidelines
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices**: https://www.w3.org/WAI/ARIA/apg/

---

**Last Updated:** 2026-01-10
**Next Review:** After implementing remaining fixes
