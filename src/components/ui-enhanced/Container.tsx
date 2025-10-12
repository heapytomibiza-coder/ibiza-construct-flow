/**
 * Container Component
 * Phase 14: Component Library Enhancement & Design System Refinement
 * 
 * Responsive container with consistent padding and max-width
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const containerVariants = cva(
  'w-full mx-auto',
  {
    variants: {
      size: {
        sm: 'max-w-3xl',
        default: 'max-w-5xl',
        lg: 'max-w-7xl',
        xl: 'max-w-screen-2xl',
        full: 'max-w-full',
      },
      padding: {
        none: '',
        sm: 'px-4 sm:px-6',
        default: 'px-4 sm:px-6 lg:px-8',
        lg: 'px-6 sm:px-8 lg:px-12',
      },
      centered: {
        true: 'text-center',
        false: '',
      },
    },
    defaultVariants: {
      size: 'default',
      padding: 'default',
      centered: false,
    },
  }
);

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  as?: React.ElementType;
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, padding, centered, as: Component = 'div', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(containerVariants({ size, padding, centered }), className)}
        {...props}
      />
    );
  }
);

Container.displayName = 'Container';
