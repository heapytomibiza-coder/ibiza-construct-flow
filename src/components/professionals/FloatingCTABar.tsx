import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, FileText } from 'lucide-react';

interface FloatingCTABarProps {
  professionalName: string;
  onMessage: () => void;
  onRequestQuote: () => void;
}

export const FloatingCTABar = ({ professionalName, onMessage, onRequestQuote }: FloatingCTABarProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show the bar after scrolling 300px
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="bg-gradient-to-r from-primary to-primary/90 text-white shadow-2xl border-t-4 border-primary-foreground/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm font-medium opacity-90">Ready to get started?</p>
              <p className="text-lg font-bold">Work with {professionalName}</p>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={onMessage}
                className="bg-white text-primary hover:bg-white/90 border-0 shadow-md"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </Button>
              <Button
                size="lg"
                onClick={onRequestQuote}
                className="bg-white text-primary hover:bg-white/90 shadow-md"
              >
                <FileText className="w-4 h-4 mr-2" />
                Request Quote
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};