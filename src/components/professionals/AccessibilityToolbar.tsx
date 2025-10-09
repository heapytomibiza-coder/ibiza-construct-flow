import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Type, 
  ZoomIn, 
  ZoomOut, 
  Contrast,
  Eye,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AccessibilityToolbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [readingMode, setReadingMode] = useState(false);

  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 10, 150);
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 10, 80);
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
    document.body.classList.toggle('high-contrast');
  };

  const toggleReadingMode = () => {
    setReadingMode(!readingMode);
    document.body.classList.toggle('reading-mode');
  };

  const resetSettings = () => {
    setFontSize(100);
    setHighContrast(false);
    setReadingMode(false);
    document.documentElement.style.fontSize = '100%';
    document.body.classList.remove('high-contrast', 'reading-mode');
  };

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        variant="outline"
        className="fixed left-4 bottom-24 z-50 w-12 h-12 rounded-full shadow-lg print:hidden touch-target"
        aria-label="Accessibility options"
      >
        <Eye className="w-5 h-5" />
      </Button>

      {/* Toolbar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed left-4 bottom-40 z-50 print:hidden"
          >
            <Card className="p-4 shadow-2xl w-64">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">Accessibility</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6"
                  aria-label="Close accessibility toolbar"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {/* Font Size Controls */}
                <div>
                  <label className="text-xs font-medium mb-2 block">
                    Text Size: {fontSize}%
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={decreaseFontSize}
                      disabled={fontSize <= 80}
                      className="flex-1 touch-target"
                      aria-label="Decrease text size"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={increaseFontSize}
                      disabled={fontSize >= 150}
                      className="flex-1 touch-target"
                      aria-label="Increase text size"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* High Contrast Toggle */}
                <Button
                  variant={highContrast ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleHighContrast}
                  className="w-full justify-start touch-target"
                  aria-pressed={highContrast}
                >
                  <Contrast className="w-4 h-4 mr-2" />
                  High Contrast
                </Button>

                {/* Reading Mode Toggle */}
                <Button
                  variant={readingMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleReadingMode}
                  className="w-full justify-start touch-target"
                  aria-pressed={readingMode}
                >
                  <Type className="w-4 h-4 mr-2" />
                  Reading Mode
                </Button>

                {/* Reset Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetSettings}
                  className="w-full touch-target"
                >
                  Reset Settings
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
