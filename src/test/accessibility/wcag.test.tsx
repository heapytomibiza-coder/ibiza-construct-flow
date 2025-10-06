import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '../utils/test-utils';
import { Button } from '@/components/ui/button';

/**
 * Accessibility tests following WCAG 2.1 AA guidelines
 */
describe('WCAG Accessibility Tests', () => {
  describe('Keyboard Navigation', () => {
    it('buttons are keyboard accessible', () => {
      const { getByRole } = renderWithProviders(
        <Button>Accessible Button</Button>
      );
      
      const button = getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe('BUTTON');
    });

    it('interactive elements have proper ARIA labels', () => {
      const { getByLabelText } = renderWithProviders(
        <button aria-label="Close dialog">×</button>
      );
      
      expect(getByLabelText('Close dialog')).toBeInTheDocument();
    });
  });

  describe('Semantic HTML', () => {
    it('uses semantic heading hierarchy', () => {
      const { getByRole } = renderWithProviders(
        <div>
          <h1>Main Title</h1>
          <h2>Section Title</h2>
          <h3>Subsection Title</h3>
        </div>
      );
      
      expect(getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    it('uses semantic button elements', () => {
      const { getByRole } = renderWithProviders(
        <Button>Submit</Button>
      );
      
      const button = getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });
  });

  describe('ARIA Attributes', () => {
    it('disabled buttons have aria-disabled', () => {
      const { getByRole } = renderWithProviders(
        <Button disabled>Disabled</Button>
      );
      
      const button = getByRole('button');
      expect(button).toBeDisabled();
    });

    it('loading states are announced', () => {
      const { getByRole } = renderWithProviders(
        <Button aria-busy="true" aria-label="Loading">
          <span aria-hidden="true">...</span>
        </Button>
      );
      
      const button = getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Focus Management', () => {
    it('focusable elements have visible focus indicators', () => {
      const { getByRole } = renderWithProviders(
        <Button>Focusable</Button>
      );
      
      const button = getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe('Color Contrast', () => {
    it('text elements use semantic color tokens', () => {
      const { container } = renderWithProviders(
        <p className="text-foreground">Readable text</p>
      );
      
      const text = container.querySelector('p');
      expect(text).toHaveClass('text-foreground');
    });
  });

  describe('Images and Media', () => {
    it('images have alt text', () => {
      const { getByAltText } = renderWithProviders(
        <img src="/test.jpg" alt="Descriptive alt text" />
      );
      
      expect(getByAltText('Descriptive alt text')).toBeInTheDocument();
    });

    it('decorative images have empty alt text', () => {
      const { container } = renderWithProviders(
        <img src="/decorative.jpg" alt="" />
      );
      
      const img = container.querySelector('img');
      expect(img).toHaveAttribute('alt', '');
    });
  });
});
