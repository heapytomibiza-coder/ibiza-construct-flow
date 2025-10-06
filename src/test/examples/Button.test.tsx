import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, userEvent } from '../utils/test-utils';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders with text', () => {
    const { getByText } = renderWithProviders(
      <Button>Click me</Button>
    );
    
    expect(getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    const { getByText } = renderWithProviders(
      <Button onClick={handleClick}>Click me</Button>
    );
    
    await user.click(getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    const handleClick = vi.fn();
    
    const { getByText } = renderWithProviders(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );
    
    const button = getByText('Disabled');
    expect(button).toBeDisabled();
  });

  it('applies variant classes correctly', () => {
    const { getByText } = renderWithProviders(
      <Button variant="destructive">Delete</Button>
    );
    
    const button = getByText('Delete');
    expect(button).toHaveClass('bg-destructive');
  });

  it('renders with different sizes', () => {
    const { getByText } = renderWithProviders(
      <Button size="sm">Small</Button>
    );
    
    const button = getByText('Small');
    expect(button).toHaveClass('h-9');
  });
});
