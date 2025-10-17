import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Smartphone, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-sage-muted-light to-background p-4">
      <Card className="max-w-md w-full p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto bg-gradient-hero rounded-2xl flex items-center justify-center shadow-luxury">
            <Smartphone className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-3xl font-display font-bold text-foreground">
            Install CS Ibiza
          </h1>
          
          <p className="text-muted-foreground text-body">
            Get quick access to Ibiza's premier construction network directly from your home screen
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Check className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" />
            <p className="text-sm text-foreground">Works offline</p>
          </div>
          <div className="flex items-start space-x-3">
            <Check className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" />
            <p className="text-sm text-foreground">Fast loading</p>
          </div>
          <div className="flex items-start space-x-3">
            <Check className="w-5 h-5 text-sage mt-0.5 flex-shrink-0" />
            <p className="text-sm text-foreground">Easy access from home screen</p>
          </div>
        </div>

        {isInstalled ? (
          <div className="space-y-4">
            <div className="p-4 bg-sage/10 border border-sage/20 rounded-lg text-center">
              <Check className="w-8 h-8 text-sage mx-auto mb-2" />
              <p className="font-medium text-sage">App installed successfully!</p>
            </div>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full bg-gradient-hero"
            >
              Open App
            </Button>
          </div>
        ) : isInstallable ? (
          <Button 
            onClick={handleInstall} 
            className="w-full h-12 bg-gradient-hero"
          >
            <Download className="w-5 h-5 mr-2" />
            Install App
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
              <p className="font-medium mb-2">On Android:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Tap the menu button (⋮) in your browser</li>
                <li>Select "Add to Home screen"</li>
                <li>Tap "Add"</li>
              </ol>
            </div>
            <Button 
              onClick={() => navigate('/')} 
              variant="outline"
              className="w-full"
            >
              Continue in Browser
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
