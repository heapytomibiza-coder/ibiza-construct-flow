import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PWAUpdatePrompt = () => {
  const { t } = useTranslation('common');
  const [showPrompt, setShowPrompt] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const handleUpdateAvailable = () => {
      setShowPrompt(true);
    };

    window.addEventListener('pwa:update-available', handleUpdateAvailable);
    
    return () => {
      window.removeEventListener('pwa:update-available', handleUpdateAvailable);
    };
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const { updateSW } = await import('../pwa');
      await updateSW(true);
    } catch (error) {
      console.error('Failed to update:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-background border border-border rounded-lg shadow-luxury p-4 z-50 animate-in slide-in-from-bottom-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-hero rounded-full flex items-center justify-center">
          <RefreshCw className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-charcoal text-sm">
            {t('pwa.updateAvailable', 'Update Available')}
          </h4>
          <p className="text-muted-foreground text-xs mt-1">
            {t('pwa.updateDescription', 'A new version is available. Refresh to get the latest features.')}
          </p>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              onClick={handleUpdate}
              disabled={isUpdating}
              className="text-xs"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  {t('pwa.updating', 'Updating...')}
                </>
              ) : (
                t('pwa.refreshNow', 'Refresh Now')
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="text-xs"
            >
              {t('pwa.later', 'Later')}
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-muted-foreground hover:text-charcoal transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PWAUpdatePrompt;
