import React, { useEffect } from 'react';
import { usePWAInstallPrompt } from '../hooks/usePWAInstallPrompt';
import { Button } from './ui/button';
import { Download, X, Smartphone } from 'lucide-react';
import { cn } from '../lib/utils';

export const PWAInstallButton: React.FC = () => {
  const { 
    showInstallPrompt, 
    showIOSInstructions, 
    handleInstallClick, 
    isStandalone, 
    isAndroid,
    isIOS
  } = usePWAInstallPrompt();
  const [isVisible, setIsVisible] = React.useState(true);
  const [isDelayed, setIsDelayed] = React.useState(true);

  // Delay showing the button to prevent flashing on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDelayed(false);
    }, 3000); // 3 second delay
    return () => clearTimeout(timer);
  }, []);

  // Don't show anything if not on mobile, already in standalone mode, or if dismissed
  if (isStandalone || (!showInstallPrompt && !showIOSInstructions) || !isVisible || isDelayed) {
    return null;
  }

  // Check if user has previously dismissed the prompt
  useEffect(() => {
    const wasDismissed = localStorage.getItem('pwaInstallDismissed');
    if (wasDismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwaInstallDismissed', 'true');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs animate-fade-in-up">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:shadow-2xl">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-pink-400 to-purple-500 p-2 rounded-lg mr-3">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-base">
              {isIOS ? 'Add to Home Screen' : 'Install GlowAI'}
            </h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 p-1 -mt-1 -mr-1"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 pl-11">
          {showIOSInstructions 
            ? 'Install this app on your iPhone: tap the share icon and then "Add to Home Screen"' 
            : isAndroid
              ? 'Get the best experience by installing the app on your device.'
              : 'Add GlowAI to your home screen for a better experience'}
        </p>
        
        {(showInstallPrompt || showIOSInstructions) && (
          <div className="flex flex-col space-y-2">
            <Button
              onClick={showInstallPrompt ? handleInstallClick : undefined}
              className={`w-full flex items-center justify-center gap-2 ${
                isAndroid ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700' : ''
              }`}
              size={isAndroid ? 'default' : 'sm'}
            >
              <Download className="h-4 w-4" />
              {isAndroid ? 'Install Now' : 'Add to Home Screen'}
            </Button>
            {isAndroid && (
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                No app store required - installs in seconds
              </p>
            )}
          </div>
        )}
        
        {showIOSInstructions && (
          <div className="mt-2 flex items-center justify-center">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <span className="mr-1">📱</span> iOS: Tap <span className="mx-1">Share</span> → <span className="ml-1">Add to Home Screen</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAInstallButton;
