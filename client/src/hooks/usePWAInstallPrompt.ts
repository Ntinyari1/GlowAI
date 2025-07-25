import { useState, useEffect } from 'react';

export const usePWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if the app is running in standalone mode
    const isInStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
    setIsStandalone(isInStandalone);

    // Check device type
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIPad = /ipad|ipod|iphone/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);
    
    setIsIOS(isIPad || (isSafari && !(window.navigator as any).standalone));
    setIsAndroid(isAndroidDevice);

    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Handle app installed event
    const handleAppInstalled = () => {
      console.log('App was installed');
      setIsInstallable(false);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // Optionally, send analytics event with outcome of user choice
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  // On Android, we can show the install prompt if:
  // 1. The beforeinstallprompt event was fired (isInstallable is true)
  // 2. The app is not already installed/standalone
  // On iOS, we show installation instructions
  // On other platforms, we show the install prompt if available
  const showInstallPrompt = isInstallable && !isStandalone && (isAndroid || (!isIOS && !isAndroid));
  const showIOSInstructions = isIOS && !isStandalone && !isAndroid;

  return {
    showInstallPrompt,
    showIOSInstructions,
    handleInstallClick,
    isStandalone,
    isInstallable,
    isAndroid,
    isIOS,
  };
};

// Add type for beforeinstallprompt event
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}
