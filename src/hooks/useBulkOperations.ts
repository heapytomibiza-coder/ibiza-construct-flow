import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BulkOperation {
  type: 'update' | 'delete' | 'insert';
  table: string;
  data?: any;
  ids?: string[];
  filter?: Record<string, any>;
}

export function useBulkOperations() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    successful: number;
    failed: number;
    errors: any[];
  }>({
    successful: 0,
    failed: 0,
    errors: []
  });

  const executeBulk = useCallback(async (operation: BulkOperation, batchSize: number = 50) => {
    setIsProcessing(true);
    setProgress(0);
    setResults({ successful: 0, failed: 0, errors: [] });

    try {
      let totalItems = 0;
      let processedItems = 0;
      const errors: any[] = [];

      switch (operation.type) {
        case 'update':
          if (!operation.ids || !operation.data) {
            throw new Error('Update operation requires ids and data');
          }
          
          totalItems = operation.ids.length;
          
          // Process in batches
          for (let i = 0; i < operation.ids.length; i += batchSize) {
            const batch = operation.ids.slice(i, i + batchSize);
            
            const { error } = await (supabase as any)
              .from(operation.table)
              .update(operation.data)
              .in('id', batch);

            if (error) {
              errors.push({ batch, error });
            } else {
              processedItems += batch.length;
            }

            setProgress((processedItems / totalItems) * 100);
          }
          break;

        case 'delete':
          if (!operation.ids) {
            throw new Error('Delete operation requires ids');
          }
          
          totalItems = operation.ids.length;
          
          for (let i = 0; i < operation.ids.length; i += batchSize) {
            const batch = operation.ids.slice(i, i + batchSize);
            
            const { error } = await (supabase as any)
              .from(operation.table)
              .delete()
              .in('id', batch);

            if (error) {
              errors.push({ batch, error });
            } else {
              processedItems += batch.length;
            }

            setProgress((processedItems / totalItems) * 100);
          }
          break;

        case 'insert':
          if (!operation.data || !Array.isArray(operation.data)) {
            throw new Error('Insert operation requires array of data');
          }
          
          totalItems = operation.data.length;
          
          for (let i = 0; i < operation.data.length; i += batchSize) {
            const batch = operation.data.slice(i, i + batchSize);
            
            const { error } = await (supabase as any)
              .from(operation.table)
              .insert(batch);

            if (error) {
              errors.push({ batch, error });
            } else {
              processedItems += batch.length;
            }

            setProgress((processedItems / totalItems) * 100);
          }
          break;
      }

      const finalResults = {
        successful: processedItems,
        failed: totalItems - processedItems,
        errors
      };

      setResults(finalResults);

      if (finalResults.failed === 0) {
        toast.success(`Successfully processed ${finalResults.successful} items`);
      } else {
        toast.warning(`Processed ${finalResults.successful} items, ${finalResults.failed} failed`);
      }

      return finalResults;
    } catch (error) {
      console.error('Bulk operation error:', error);
      toast.error('Bulk operation failed');
      throw error;
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  }, []);

  const reset = useCallback(() => {
    setProgress(0);
    setResults({ successful: 0, failed: 0, errors: [] });
  }, []);

  return {
    executeBulk,
    isProcessing,
    progress,
    results,
    reset
  };
}
