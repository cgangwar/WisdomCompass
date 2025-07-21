import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Download, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running on iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if already running in standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                       (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Don't show if already prompted recently
      const lastPrompted = localStorage.getItem('pwa-prompt-dismissed');
      const now = Date.now();
      const threeDays = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
      
      if (!lastPrompted || now - parseInt(lastPrompted) > threeDays) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show prompt after some time if not standalone and not recently dismissed
    if (iOS && !standalone) {
      const lastPrompted = localStorage.getItem('pwa-prompt-dismissed-ios');
      const now = Date.now();
      const threeDays = 3 * 24 * 60 * 60 * 1000;
      
      if (!lastPrompted || now - parseInt(lastPrompted) > threeDays) {
        setTimeout(() => setShowPrompt(true), 10000); // Show after 10 seconds
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    const key = isIOS ? 'pwa-prompt-dismissed-ios' : 'pwa-prompt-dismissed';
    localStorage.setItem(key, Date.now().toString());
  };

  // Don't show if already in standalone mode
  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
      <Card className="shadow-lg border border-sage/20 bg-card/95 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-card-foreground mb-2">
                Install Wisdom Compass
              </h3>
              <p className="text-xs text-sage mb-3">
                {isIOS 
                  ? "Add to your home screen for quick access and a better experience."
                  : "Install this app for offline access and a native app experience."
                }
              </p>
              
              {isIOS ? (
                <div className="space-y-2 text-xs text-sage">
                  <div className="flex items-center space-x-2">
                    <Share className="w-4 h-4" />
                    <span>Tap the share button</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 flex items-center justify-center text-xs font-bold border border-sage rounded">+</span>
                    <span>Select "Add to Home Screen"</span>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={handleInstallClick}
                    className="bg-sage text-white hover:bg-sage-dark flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Install App
                  </Button>
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="p-1 h-6 w-6 text-sage hover:bg-sage/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}