import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, Copy, Check } from 'lucide-react';
import { useAIContentGeneration } from '@/hooks/useAIContentGeneration';

interface ContentGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: 'job_description' | 'profile_bio' | 'review_response' | 'message';
  input: Record<string, any>;
  entityId?: string;
  onUseContent?: (content: string) => void;
}

export function ContentGeneratorModal({
  open,
  onOpenChange,
  contentType,
  input,
  entityId,
  onUseContent,
}: ContentGeneratorModalProps) {
  const { isGenerating, generatedContent, generateContent, markContentAsUsed } =
    useAIContentGeneration();
  const [copied, setCopied] = useState(false);
  const [localContent, setLocalContent] = useState('');

  const handleGenerate = async () => {
    const result = await generateContent({ contentType, input, entityId });
    if (result) {
      setLocalContent(result.content);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(localContent || generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUse = () => {
    const content = localContent || generatedContent;
    if (onUseContent && content) {
      onUseContent(content);
      onOpenChange(false);
    }
  };

  const getTitle = () => {
    switch (contentType) {
      case 'job_description':
        return 'Generate Job Description';
      case 'profile_bio':
        return 'Generate Professional Bio';
      case 'review_response':
        return 'Generate Review Response';
      case 'message':
        return 'Generate Message';
      default:
        return 'Generate Content';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {getTitle()}
          </DialogTitle>
          <DialogDescription>
            AI will generate professional content based on your input
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!generatedContent && !localContent ? (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Click generate to create AI-powered content
              </p>
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Generated Content</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-8"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Textarea
                  value={localContent || generatedContent}
                  onChange={(e) => setLocalContent(e.target.value)}
                  rows={12}
                  className="resize-none"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? 'Generating...' : 'Regenerate'}
                </Button>
                <Button onClick={handleUse} className="flex-1">
                  Use This Content
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}