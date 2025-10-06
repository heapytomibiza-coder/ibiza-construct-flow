/**
 * Error handling hook
 * Provides consistent error handling across the app
 */
import { useCallback } from 'react';
import { toast } from 'sonner';
import { classifyError, logError, ErrorType } from '@/utils/errorUtils';
import { getAuthRoute } from '@/lib/navigation';

export const useErrorHandler = () => {
  const handleError = useCallback((error: unknown, context?: Record<string, any>) => {
    const classified = classifyError(error);
    
    // Log error
    logError(error, context);
    
    // Show appropriate toast based on error type
    switch (classified.type) {
      case ErrorType.NETWORK:
        toast.error('Connection Error', {
          description: classified.userMessage,
          action: {
            label: 'Retry',
            onClick: () => window.location.reload()
          }
        });
        break;
        
      case ErrorType.AUTH:
        toast.error('Authentication Required', {
          description: classified.userMessage,
          action: {
            label: 'Sign In',
            onClick: () => window.location.href = getAuthRoute('signin')
          }
        });
        break;
        
      case ErrorType.VALIDATION:
        toast.error('Invalid Input', {
          description: classified.userMessage
        });
        break;
        
      case ErrorType.PERMISSION:
        toast.error('Access Denied', {
          description: classified.userMessage
        });
        break;
        
      case ErrorType.NOT_FOUND:
        toast.error('Not Found', {
          description: classified.userMessage
        });
        break;
        
      case ErrorType.SERVER:
        toast.error('Server Error', {
          description: classified.userMessage,
          action: {
            label: 'Contact Support',
            onClick: () => window.location.href = '/contact'
          }
        });
        break;
        
      default:
        toast.error('Error', {
          description: classified.userMessage
        });
    }
    
    return classified;
  }, []);
  
  return { handleError };
};
