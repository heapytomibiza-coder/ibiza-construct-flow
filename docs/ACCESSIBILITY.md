# Accessibility Guidelines

This document outlines the accessibility standards implemented across the Ibiza Build Flow platform.

## Core Principles

All components follow WCAG 2.1 Level AA standards with the following key requirements:

### 1. Touch Target Sizes
- **Minimum size**: 44px × 44px for all interactive elements
- Applied via `min-h-[44px]` and `min-w-[44px]` Tailwind classes
- Ensures comfortable tapping on mobile devices

### 2. Keyboard Navigation
- All interactive elements are keyboard accessible
- Tab order follows logical visual flow
- Focus indicators visible on all focusable elements
- Arrow key navigation for Kanban boards and lists

### 3. Screen Reader Support
- Proper ARIA labels on all interactive elements
- ARIA roles for semantic regions
- ARIA-hidden on decorative icons
- Live regions for dynamic content updates

### 4. Color Contrast
- All text meets WCAG AA contrast ratios:
  - Normal text: 4.5:1
  - Large text: 3:1
- Interactive elements have visible focus indicators
- Never rely on color alone to convey information

### 5. Semantic HTML
- Proper heading hierarchy (h1-h6)
- Lists use `<ul>`, `<ol>` with `<li>`
- Forms use `<label>` elements
- Buttons vs links used appropriately

## Component-Specific Guidelines

### PresetChips Component
```tsx
// ✅ Good: Proper ARIA labels
<Button
  aria-label={`Use preset: ${preset.name}, last used ${timeAgo}`}
  role="listitem"
  className="min-h-[44px]"
>
```

### ContextualQuickReplies Component
```tsx
// ✅ Good: Region with label + individual button labels
<div role="region" aria-label="Quick reply suggestions">
  <Button 
    aria-label={`Send quick reply: ${reply}`}
    className="min-h-[44px]"
  />
</div>
```

### ApplicantKanban Component
```tsx
// ✅ Good: Keyboard navigation + ARIA labels
<Card
  draggable
  onKeyDown={(e) => handleKeyDown(e, id, status)}
  tabIndex={0}
  aria-label={`${name} - ${status}. Press arrow keys to move.`}
  className="focus-visible:ring-2"
>
```

### EditableReviewChips Component
```tsx
// ✅ Good: Form semantics + labels
<div role="form" aria-label="Job request review form">
  <label htmlFor={`chip-${id}`}>{label}</label>
  <p id={`chip-${id}`} role="status">{value}</p>
  <Button aria-label={`Edit ${label}`} className="min-h-[44px]" />
</div>
```

### GlobalSearch Component
```tsx
// ✅ Good: Keyboard shortcuts + ARIA attributes
<CommandDialog>
  <CommandInput aria-label="Search everything" />
  <CommandList aria-label="Search results" />
  <div role="note" aria-label="Keyboard shortcuts">
    <kbd>↑↓</kbd> to navigate
    <kbd>Enter</kbd> to select
  </div>
</CommandDialog>
```

## Focus Management

### Focus Indicators
All focusable elements use consistent focus styling:
```css
.focus-visible:ring-2 
.focus-visible:ring-ring 
.focus-visible:ring-offset-2
```

### Skip Links
For keyboard users to bypass navigation:
```tsx
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

## Screen Reader Classes

### Utility Classes
- `.sr-only`: Visually hidden but readable by screen readers
- `.sr-only-focusable`: Hidden until focused
- `aria-hidden="true"`: Hide from screen readers (decorative icons)

### Example Usage
```tsx
// Visual icon with hidden text for screen readers
<Button>
  <Icon className="w-4 h-4" aria-hidden="true" />
  <span className="sr-only">Edit profile</span>
</Button>

// Loading states
<Button disabled={loading} aria-busy={loading}>
  {loading ? (
    <>
      <span className="sr-only">Submitting your request...</span>
      <span aria-hidden="true">Submitting...</span>
    </>
  ) : (
    'Submit'
  )}
</Button>
```

## Testing Checklist

### Manual Testing
- [ ] Navigate entire app using keyboard only
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Verify all interactive elements are 44px minimum
- [ ] Check color contrast with tools (WebAIM, axe DevTools)
- [ ] Test with 200% zoom
- [ ] Verify focus indicators are visible

### Automated Testing
Run accessibility audits:
```bash
# Using axe-core
npm run test:a11y

# Using Lighthouse
lighthouse --only-categories=accessibility https://yourapp.com
```

## Common Patterns

### Loading States
```tsx
<div role="status" aria-live="polite" aria-busy={loading}>
  {loading ? 'Loading...' : content}
</div>
```

### Error Messages
```tsx
<div role="alert" aria-live="assertive">
  {error && <p>{error.message}</p>}
</div>
```

### Modals/Dialogs
```tsx
<Dialog 
  role="dialog" 
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">Confirm Action</h2>
  <p id="dialog-description">Are you sure?</p>
</Dialog>
```

### Form Validation
```tsx
<Input
  aria-invalid={!!error}
  aria-describedby={error ? "error-message" : undefined}
/>
{error && (
  <p id="error-message" role="alert">
    {error}
  </p>
)}
```

## Mobile-Specific Considerations

### Touch Targets on Mobile
- Minimum 44px × 44px (WCAG 2.1 Level AAA)
- Extra padding between adjacent targets
- Avoid hover-only interactions

### Gestures
- Provide alternatives to complex gestures
- Support both swipe and button-based navigation
- Announce gesture hints to screen readers

### Orientation
- Support both portrait and landscape
- Don't lock orientation unless critical
- Test all breakpoints

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [MDN ARIA Best Practices](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques)
- [a11y Project Checklist](https://www.a11yproject.com/checklist/)
