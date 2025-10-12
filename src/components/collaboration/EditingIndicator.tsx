/**
 * Editing Indicator Component
 * Phase 18: Real-time Collaboration & Presence System
 * 
 * Visual indicator for collaborative editing
 */

import { EditingIndicator as EditingIndicatorType } from '@/lib/collaboration';
import { cn } from '@/lib/utils';

interface EditingIndicatorProps {
  indicators: EditingIndicatorType[];
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const positionClasses = {
  top: '-top-1 left-0 right-0',
  bottom: '-bottom-1 left-0 right-0',
  left: 'top-0 bottom-0 -left-1',
  right: 'top-0 bottom-0 -right-1',
};

export function EditingIndicator({
  indicators,
  position = 'top',
  className,
}: EditingIndicatorProps) {
  if (indicators.length === 0) {
    return null;
  }

  const isHorizontal = position === 'top' || position === 'bottom';

  return (
    <div className={cn('absolute pointer-events-none z-10', positionClasses[position], className)}>
      <div
        className={cn(
          'absolute',
          isHorizontal ? 'h-0.5 w-full' : 'w-0.5 h-full'
        )}
        style={{
          background: indicators.length === 1
            ? indicators[0].color
            : `linear-gradient(${isHorizontal ? 'to right' : 'to bottom'}, ${indicators.map(i => i.color).join(', ')})`,
        }}
      />
      
      {indicators.length === 1 && (
        <div
          className="absolute text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
          style={{
            backgroundColor: indicators[0].color,
            color: 'white',
            ...(position === 'top' && { top: '-20px', left: '0' }),
            ...(position === 'bottom' && { bottom: '-20px', left: '0' }),
            ...(position === 'left' && { left: '-10px', top: '0', transform: 'translateX(-100%)' }),
            ...(position === 'right' && { right: '-10px', top: '0', transform: 'translateX(100%)' }),
          }}
        >
          {indicators[0].userName} is editing
        </div>
      )}

      {indicators.length > 1 && (
        <div
          className="absolute text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap bg-gray-800 text-white"
          style={{
            ...(position === 'top' && { top: '-20px', left: '0' }),
            ...(position === 'bottom' && { bottom: '-20px', left: '0' }),
            ...(position === 'left' && { left: '-10px', top: '0', transform: 'translateX(-100%)' }),
            ...(position === 'right' && { right: '-10px', top: '0', transform: 'translateX(100%)' }),
          }}
        >
          {indicators.length} users editing
        </div>
      )}
    </div>
  );
}
