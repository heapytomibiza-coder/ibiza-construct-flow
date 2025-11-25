import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Languages, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface MessageTranslatorProps {
  originalText: string;
  originalLang: string;
  targetLang: string;
  className?: string;
}

export function MessageTranslator({
  originalText,
  originalLang,
  targetLang,
  className
}: MessageTranslatorProps) {
  const { t } = useTranslation();
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const handleTranslate = async () => {
    if (translatedText) {
      setShowTranslation(!showTranslation);
      return;
    }

    setIsTranslating(true);
    try {
      // Call Lovable AI for translation
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: originalText,
          sourceLang: originalLang,
          targetLang: targetLang,
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      setTranslatedText(data.translatedText);
      setShowTranslation(true);
    } catch (error) {
      console.error('Translation error:', error);
      // Fallback: show a message that translation is unavailable
      setTranslatedText('Translation service temporarily unavailable');
      setShowTranslation(true);
    } finally {
      setIsTranslating(false);
    }
  };

  // Don't show translator if same language
  if (originalLang === targetLang) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleTranslate}
        disabled={isTranslating}
        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
      >
        {isTranslating ? (
          <>
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            {t('common.translating')}
          </>
        ) : (
          <>
            <Languages className="h-3 w-3 mr-1" />
            {showTranslation ? t('common.showOriginal') : t('common.translate')}
          </>
        )}
      </Button>

      {showTranslation && translatedText && (
        <div className="p-3 rounded-lg bg-muted/50 border border-border text-sm">
          <div className="flex items-start gap-2">
            <Languages className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">
                {t('common.translatedFrom', { lang: originalLang.toUpperCase() })}
              </p>
              <p className="text-foreground">{translatedText}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
