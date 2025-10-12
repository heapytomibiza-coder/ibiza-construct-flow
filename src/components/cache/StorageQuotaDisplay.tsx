/**
 * Storage Quota Display Component
 * Phase 21: Advanced Caching & Offline Support
 * 
 * Shows storage usage and quota
 */

import { useStorageQuota } from '@/hooks/cache';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { HardDrive, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StorageQuotaDisplayProps {
  className?: string;
}

export function StorageQuotaDisplay({ className }: StorageQuotaDisplayProps) {
  const { quota, isPersisted, requestPersistence, formattedUsage, formattedQuota } = useStorageQuota();

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Storage Usage</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {formattedUsage} / {formattedQuota}
        </span>
      </div>

      <Progress value={quota.percentage} className="h-2" />

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {quota.percentage.toFixed(1)}% used
        </span>
        
        {!isPersisted && (
          <Button
            variant="outline"
            size="sm"
            onClick={requestPersistence}
            className="gap-2"
          >
            <Shield className="h-3 w-3" />
            Request Persistence
          </Button>
        )}
        
        {isPersisted && (
          <div className="flex items-center gap-1 text-green-600">
            <Shield className="h-3 w-3" />
            <span>Persistent</span>
          </div>
        )}
      </div>
    </div>
  );
}
