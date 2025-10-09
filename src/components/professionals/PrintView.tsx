import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { toast } from 'sonner';

interface PrintViewProps {
  professionalName: string;
}

export const PrintView = ({ professionalName }: PrintViewProps) => {
  const handlePrint = () => {
    // Add print-specific class to body
    document.body.classList.add('print-mode');
    
    // Trigger print dialog
    window.print();
    
    // Remove print class after print dialog closes
    setTimeout(() => {
      document.body.classList.remove('print-mode');
    }, 100);
    
    toast.success('Print dialog opened');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePrint}
      className="gap-2 touch-target print:hidden"
    >
      <Printer className="w-4 h-4" />
      <span className="hidden sm:inline">Print Profile</span>
      <span className="sm:hidden">Print</span>
    </Button>
  );
};
