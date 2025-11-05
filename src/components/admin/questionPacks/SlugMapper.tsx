/**
 * SlugMapper - Validate and map micro_slug
 */

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { checkSlugExists } from '@/lib/questionPacks/validateQuestionPack';
import { supabase } from '@/integrations/supabase/client';

interface SlugMapperProps {
  autoSuggested: string;
  value: string;
  onChange: (value: string) => void;
}

export function SlugMapper({ autoSuggested, value, onChange }: SlugMapperProps) {
  const [slugExists, setSlugExists] = useState(false);
  const [checking, setChecking] = useState(false);
  
  useEffect(() => {
    const checkSlug = async () => {
      if (!value) return;
      setChecking(true);
      const exists = await checkSlugExists(supabase, value);
      setSlugExists(exists);
      setChecking(false);
    };
    
    const timer = setTimeout(checkSlug, 500);
    return () => clearTimeout(timer);
  }, [value]);
  
  const isValid = /^[a-z0-9-]+$/.test(value);
  
  return (
    <div className="space-y-2">
      <Label>Micro Slug</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. floor-tiling"
      />
      
      {value !== autoSuggested && (
        <p className="text-sm text-muted-foreground">
          Auto-suggested: <code className="bg-muted px-1 py-0.5 rounded">{autoSuggested}</code>
        </p>
      )}
      
      {!isValid && value && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Slug must be kebab-case (lowercase letters, numbers, and hyphens only)
          </AlertDescription>
        </Alert>
      )}
      
      {slugExists && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This slug already exists in the database. Importing will create a new version.
          </AlertDescription>
        </Alert>
      )}
      
      {isValid && !slugExists && !checking && value && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Slug is valid and available
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
