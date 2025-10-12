/**
 * Accessibility Testing Utilities
 * Phase 23: Testing & Quality Assurance System
 * 
 * Helpers for testing accessibility compliance
 */

/**
 * Check if element has accessible name
 */
export function hasAccessibleName(element: HTMLElement): boolean {
  const label = element.getAttribute('aria-label');
  const labelledBy = element.getAttribute('aria-labelledby');
  const title = element.getAttribute('title');
  
  return !!(label || labelledBy || title);
}

/**
 * Check if button/link has appropriate role
 */
export function hasValidRole(element: HTMLElement): boolean {
  const tagName = element.tagName.toLowerCase();
  const role = element.getAttribute('role');
  
  if (tagName === 'button' || tagName === 'a') {
    return true;
  }
  
  return role === 'button' || role === 'link';
}

/**
 * Check if interactive element is keyboard accessible
 */
export function isKeyboardAccessible(element: HTMLElement): boolean {
  const tagName = element.tagName.toLowerCase();
  const tabIndex = element.getAttribute('tabindex');
  
  // Natively focusable elements
  if (['a', 'button', 'input', 'select', 'textarea'].includes(tagName)) {
    return tabIndex !== '-1';
  }
  
  // Custom interactive elements
  return tabIndex !== null && tabIndex !== '-1';
}

/**
 * Check if form field has label
 */
export function hasLabel(input: HTMLElement): boolean {
  const id = input.id;
  const ariaLabel = input.getAttribute('aria-label');
  const ariaLabelledBy = input.getAttribute('aria-labelledby');
  
  if (ariaLabel || ariaLabelledBy) {
    return true;
  }
  
  if (id) {
    const label = document.querySelector(`label[for="${id}"]`);
    return !!label;
  }
  
  return false;
}

/**
 * Check color contrast ratio
 * Simplified version - real implementation would calculate actual contrast
 */
export function hasValidContrast(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  const color = style.color;
  const backgroundColor = style.backgroundColor;
  
  // This is a simplified check
  // Real implementation would use WCAG contrast calculation
  return color !== backgroundColor;
}

/**
 * Check if images have alt text
 */
export function hasAltText(img: HTMLImageElement): boolean {
  return img.hasAttribute('alt');
}

/**
 * Get accessibility violations
 */
export interface A11yViolation {
  element: HTMLElement;
  issue: string;
  severity: 'error' | 'warning';
}

export function getAccessibilityViolations(
  container: HTMLElement
): A11yViolation[] {
  const violations: A11yViolation[] = [];
  
  // Check all images for alt text
  const images = container.querySelectorAll('img');
  images.forEach((img) => {
    if (!hasAltText(img)) {
      violations.push({
        element: img as HTMLElement,
        issue: 'Image missing alt text',
        severity: 'error',
      });
    }
  });
  
  // Check all buttons for accessible names
  const buttons = container.querySelectorAll('button');
  buttons.forEach((button) => {
    if (!hasAccessibleName(button as HTMLElement) && !button.textContent?.trim()) {
      violations.push({
        element: button as HTMLElement,
        issue: 'Button missing accessible name',
        severity: 'error',
      });
    }
  });
  
  // Check form inputs for labels
  const inputs = container.querySelectorAll('input:not([type="hidden"])');
  inputs.forEach((input) => {
    if (!hasLabel(input as HTMLElement)) {
      violations.push({
        element: input as HTMLElement,
        issue: 'Form input missing label',
        severity: 'error',
      });
    }
  });
  
  // Check for keyboard accessibility
  const interactive = container.querySelectorAll('[onclick], [role="button"]');
  interactive.forEach((element) => {
    if (!isKeyboardAccessible(element as HTMLElement)) {
      violations.push({
        element: element as HTMLElement,
        issue: 'Interactive element not keyboard accessible',
        severity: 'warning',
      });
    }
  });
  
  return violations;
}

/**
 * Assert no accessibility violations
 */
export function assertAccessible(container: HTMLElement): void {
  const violations = getAccessibilityViolations(container);
  
  if (violations.length > 0) {
    const errorMessages = violations.map(
      v => `${v.severity.toUpperCase()}: ${v.issue}`
    );
    throw new Error(
      `Accessibility violations found:\n${errorMessages.join('\n')}`
    );
  }
}
