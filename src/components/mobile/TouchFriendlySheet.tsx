import { ReactNode } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface TouchFriendlySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export const TouchFriendlySheet = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  side = 'bottom'
}: TouchFriendlySheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className="h-[85vh] rounded-t-xl lg:h-full lg:rounded-none"
      >
        {/* Drag handle for mobile */}
        <div className="flex justify-center mb-4 lg:hidden">
          <div className="w-12 h-1 bg-muted rounded-full" />
        </div>

        <SheetHeader>
          <SheetTitle className="text-lg">{title}</SheetTitle>
          {description && (
            <SheetDescription>{description}</SheetDescription>
          )}
        </SheetHeader>

        <div className="mt-6 overflow-y-auto max-h-[calc(85vh-100px)]">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
};
