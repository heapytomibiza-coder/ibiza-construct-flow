/**
 * Divider Component
 * Phase 14: Component Library Enhancement & Design System Refinement
 * 
 * Semantic divider with label support and customizable styling
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const dividerVariants = cva(
  'border-border',
  {
    variants: {
      orientation: {
        horizontal: 'w-full border-t',
        vertical: 'h-full border-l',
      },
      variant: {
        solid: 'border-solid',
        dashed: 'border-dashed',
        dotted: 'border-dotted',
      },
      spacing: {
        none: '',
        sm: '',
        default: '',
        lg: '',
      },
    },
    compoundVariants: [
      {
        orientation: 'horizontal',
        spacing: 'sm',
        className: 'my-2',
      },
      {
        orientation: 'horizontal',
        spacing: 'default',
        className: 'my-4',
      },
      {
        orientation: 'horizontal',
        spacing: 'lg',
        className: 'my-6',
      },
      {
        orientation: 'vertical',
        spacing: 'sm',
        className: 'mx-2',
      },
      {
        orientation: 'vertical',
        spacing: 'default',
        className: 'mx-4',
      },
      {
        orientation: 'vertical',
        spacing: 'lg',
        className: 'mx-6',
      },
    ],
    defaultVariants: {
      orientation: 'horizontal',
      variant: 'solid',
      spacing: 'default',
    },
  }
);

export interface DividerProps
  extends React.HTMLAttributes<HTMLHRElement>,
    VariantProps<typeof dividerVariants> {
  label?: string;
  labelPosition?: 'left' | 'center' | 'right';
}

export const Divider = React.forwardRef<HTMLHRElement, DividerProps>(
  ({ className, orientation, variant, spacing, label, labelPosition = 'center', ...props }, ref) => {
    if (label && orientation === 'horizontal') {
      const positionClasses = {
        left: 'justify-start',
        center: 'justify-center',
        right: 'justify-end',
      };

      return (
        <div
          className={cn(
            'flex items-center',
            dividerVariants({ spacing }),
            positionClasses[labelPosition]
          )}
        >
          {labelPosition !== 'left' && (
            <hr
              ref={ref}
              className={cn(
                'flex-1',
                dividerVariants({ orientation, variant, spacing: 'none' }),
                className
              )}
              {...props}
            />
          )}
          <span className="px-3 text-sm text-muted-foreground whitespace-nowrap">
            {label}
          </span>
          {labelPosition !== 'right' && (
            <hr
              className={cn(
                'flex-1',
                dividerVariants({ orientation, variant, spacing: 'none' }),
                className
              )}
            />
          )}
        </div>
      );
    }

    return (
      <hr
        ref={ref}
        className={cn(dividerVariants({ orientation, variant, spacing }), className)}
        {...props}
      />
    );
  }
);

Divider.displayName = 'Divider';
