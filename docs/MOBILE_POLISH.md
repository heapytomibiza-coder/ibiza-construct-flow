# Mobile Polish Guide

Comprehensive guide for mobile-specific polish and optimizations implemented in Phase 6.

## Overview

This document covers all mobile-specific enhancements including:
- Sticky Mobile CTAs
- Safe Area Handling
- Smart Scroll Behavior
- Touch Optimizations
- Gesture Support

## Sticky Mobile CTA

### Component: `StickyMobileCTA`

Location: `src/components/mobile/StickyMobileCTA.tsx`

#### Features
- **Context-aware actions**: Primary and secondary buttons adapt to current state
- **Safe area support**: Automatically respects device notch and home indicator
- **Loading states**: Built-in spinner and disabled state handling
- **Gradient styling**: Premium copper gradient on primary button
- **Z-index management**: Ensures CTA stays above content (z-50)

#### Usage

```tsx
import { StickyMobileCTA } from '@/components/mobile/StickyMobileCTA';

<StickyMobileCTA
  primaryAction={{
    label: 'Continue',
    onClick: handleNext,
    disabled: !isValid,
    loading: isSubmitting
  }}
  secondaryAction={{
    label: 'Back',
    onClick: handleBack
  }}
  showOnDesktop={false} // Optional: hide on desktop
/>
```

#### Integration Examples

**CanonicalJobWizard** (`src/components/wizard/canonical/CanonicalJobWizard.tsx`):
- Dynamically changes primary button label based on step
- Shows/hides secondary button based on step position
- Validates form data before enabling continue button
- Handles loading state during submission

```tsx
{isMobile && currentStep < 8 && (
  <StickyMobileCTA
    primaryAction={{
      label: currentStep === 7 ? 'Post Job' : 'Continue',
      onClick: currentStep === 7 ? handleSubmit : handleNext,
      disabled: !canProceed(),
      loading: loading
    }}
    secondaryAction={currentStep > 1 ? {
      label: 'Back',
      onClick: handleBack
    } : undefined}
  />
)}
```

**MobileJobWizard** (`src/components/wizard/MobileJobWizard.tsx`):
- Already integrated with context-aware actions
- Uses for multi-step job posting flow

## Safe Area Handling

### SafeAreaProvider

Location: `src/components/mobile/SafeAreaProvider.tsx`

#### Features
- Detects iOS safe area insets (notch, home indicator)
- Provides React context for safe area values
- Updates on orientation change
- Ready state to prevent layout shift

#### Usage

```tsx
import { useSafeArea } from '@/components/mobile/SafeAreaProvider';

const MyComponent = () => {
  const { insets, isReady } = useSafeArea();
  
  return (
    <div style={{ paddingBottom: `${insets.bottom}px` }}>
      Content respects safe area
    </div>
  );
};
```

### CSS Utilities

Location: `src/index.css`

#### Available Classes

```css
/* Individual sides */
.safe-top     /* padding-top: env(safe-area-inset-top) */
.safe-bottom  /* padding-bottom: env(safe-area-inset-bottom) */
.safe-left    /* padding-left: env(safe-area-inset-left) */
.safe-right   /* padding-right: env(safe-area-inset-right) */

/* Combined */
.safe-x       /* left + right */
.safe-y       /* top + bottom */

/* For fixed elements */
.sticky-header  /* Sticky header with safe-top */
.sticky-footer  /* Fixed footer with all safe areas */
```

#### Usage in Components

**MobileBottomNav** (`src/components/mobile/MobileBottomNav.tsx`):
```tsx
<div className="flex items-center justify-around px-2 py-2 pb-safe">
  {/* Navigation items */}
</div>
```

**Sheet Component** (`src/components/ui/sheet.tsx`):
```tsx
className={cn(
  sheetVariants({ side }),
  side === "bottom" && "safe-bottom",
  className
)}
```

### Viewport Meta Tag

Ensure your HTML includes the viewport-fit=cover meta tag:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

This enables safe-area-inset CSS environment variables on iOS.

## Smart Scroll Behavior

### useScrollHide Hook

Location: `src/hooks/useScrollHide.ts`

#### Features
- Hides UI elements when scrolling down
- Shows UI elements when scrolling up
- Configurable threshold and delay
- Detects when user is at top of page
- Passive scroll listeners for performance

#### API

```tsx
const { isVisible, isAtTop } = useScrollHide({
  threshold: 10,      // Minimum scroll delta to trigger hide/show
  hideDelay: 150      // Delay before hiding (ms)
});
```

#### Usage

**MobileBottomNav** (`src/components/mobile/MobileBottomNav.tsx`):
```tsx
const { isVisible } = useScrollHide({ threshold: 10, hideDelay: 150 });

<nav 
  className={cn(
    "fixed bottom-0 left-0 right-0 z-40",
    "transition-transform duration-300 ease-in-out",
    isVisible ? "translate-y-0" : "translate-y-full"
  )}
>
  {/* Navigation */}
</nav>
```

#### Behavior

1. **Scrolling Down**: 
   - Waits for `hideDelay` ms
   - Hides element with smooth transition
   - User can still scroll up to reveal

2. **Scrolling Up**:
   - Shows immediately (no delay)
   - Smooth transition
   - Full visibility restored

3. **At Top**:
   - Always visible
   - Ignores scroll direction

## Touch Optimizations

### Touch Target Sizing

All interactive elements follow WCAG 2.1 Level AA guidelines:
- **Minimum size**: 44px × 44px
- **Preferred size**: 48px × 48px for primary actions

#### CSS Classes

```css
/* From index.css */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.interactive-button {
  /* Includes touch-target sizing */
  min-h-[44px] min-w-[44px]
}

.interactive-chip {
  /* Includes touch-target sizing */
  min-h-[44px] min-w-[44px]
}
```

#### Applied In

- **StickyMobileCTA**: Primary/secondary buttons use `min-h-[48px]`
- **MobileBottomNav**: Nav items use `min-h-[56px]`
- **PresetChips**: All chips use `min-h-[44px] min-w-[44px]`
- **EditableReviewChips**: All chips use `min-h-[44px] min-w-[44px]`

### Input Optimization

Prevents iOS zoom on input focus:

```css
.mobile-optimized-input {
  font-size: 16px; /* Prevents zoom on iOS */
  min-height: 44px;
}

@media (max-width: 768px) {
  .mobile-optimized-input {
    font-size: 16px !important;
  }
}
```

## Layout Considerations

### Content Spacing for Bottom UI

Use `.thumb-reach` utility for content that needs space above bottom navigation:

```css
.thumb-reach {
  margin-bottom: 5rem; /* 80px for mobile bottom nav */
}

@media (min-width: 768px) {
  .thumb-reach {
    margin-bottom: 0; /* Remove on desktop */
  }
}
```

### Wizard/Form Pages with CTA

Add bottom padding to prevent content from being hidden behind sticky CTA:

```tsx
<div className="min-h-screen pb-24 md:pb-0">
  {/* Page content */}
</div>
```

- `pb-24` = 96px (enough for CTA + safe area)
- `md:pb-0` = removes padding on desktop

## Z-Index Hierarchy

Ensure proper layering of mobile UI elements:

```
z-50: StickyMobileCTA, Modal overlays
z-40: MobileBottomNav, Sticky headers
z-30: Dropdowns, tooltips
z-20: Floating elements
z-10: Elevated cards
z-0: Base content
```

## Performance Considerations

### Passive Event Listeners

All scroll listeners use `{ passive: true }` for better performance:

```tsx
window.addEventListener('scroll', handleScroll, { passive: true });
```

### Debouncing/Throttling

The `useScrollHide` hook implements intelligent debouncing:
- Hide actions are delayed (`hideDelay` ms)
- Show actions are immediate (better UX)
- Previous timeouts are cleared (prevents race conditions)

### CSS Transforms

Use `transform` for animations instead of positional properties:

```css
/* Good - GPU accelerated */
.translate-y-full { transform: translateY(100%); }

/* Bad - causes reflow */
.bottom-minus-100 { bottom: -100px; }
```

## Testing Checklist

### iOS Safari
- [ ] Safe areas respected on iPhone X and newer
- [ ] Bottom sheets don't get cut off by home indicator
- [ ] Sticky CTA respects notch and home indicator
- [ ] Scroll behavior smooth and responsive
- [ ] No zoom on input focus

### Android Chrome
- [ ] Touch targets minimum 44px
- [ ] Bottom navigation hides/shows smoothly
- [ ] No layout shift on keyboard open
- [ ] Back button works correctly

### Gestures
- [ ] Swipe gestures don't conflict with browser navigation
- [ ] Pull-to-refresh works on mobile
- [ ] Smooth scrolling on long pages

### Accessibility
- [ ] All interactive elements keyboard accessible
- [ ] Screen reader announces state changes
- [ ] Focus visible on all interactive elements
- [ ] Reduced motion respected

## Common Patterns

### Wizard Steps with Mobile CTA

```tsx
const MyWizard = () => {
  const isMobile = useIsMobile();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      {/* Content */}
      
      {isMobile && (
        <StickyMobileCTA
          primaryAction={{
            label: step === lastStep ? 'Submit' : 'Continue',
            onClick: step === lastStep ? handleSubmit : handleNext,
            disabled: !isStepValid(step),
            loading: loading
          }}
          secondaryAction={step > 1 ? {
            label: 'Back',
            onClick: handleBack
          } : undefined}
        />
      )}
    </div>
  );
};
```

### Bottom Navigation with Scroll Hide

```tsx
const MyNav = () => {
  const { isVisible } = useScrollHide();
  
  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-40",
      "transition-transform duration-300",
      isVisible ? "translate-y-0" : "translate-y-full"
    )}>
      <div className="pb-safe">
        {/* Nav items */}
      </div>
    </nav>
  );
};
```

### Modal with Safe Area

```tsx
<Sheet>
  <SheetContent side="bottom" className="safe-bottom">
    {/* Content automatically respects safe area */}
  </SheetContent>
</Sheet>
```

## Browser Support

- **iOS Safari**: 11.2+ (safe-area-inset support)
- **Android Chrome**: All versions (graceful fallback to 0px)
- **iOS Chrome**: Full support
- **Samsung Internet**: Full support

## Future Enhancements

- [ ] Haptic feedback on touch interactions
- [ ] Advanced gesture recognition (swipe to dismiss)
- [ ] Dynamic island support for iOS 16+
- [ ] Adaptive CTA sizing based on content
- [ ] Multi-CTA layouts for complex actions
