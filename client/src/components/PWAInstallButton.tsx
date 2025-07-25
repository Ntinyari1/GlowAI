import React from 'react';
import { usePWAInstallPrompt } from '../hooks/usePWAInstallPrompt';
import { Button } from './ui/button';
import { Download, X } from 'lucide-react';
import { cn } from '../lib/utils';

export const PWAInstallButton: React.FC = () => {
  const { showInstallPrompt, showIOSInstructions, handleInstallClick, isStandalone } = usePWAInstallPrompt();
  const [isVisible, setIsVisible] = React.useState(true);

  // Don't show anything if not on mobile or if already in standalone mode
  if (isStandalone || (!showInstallPrompt && !showIOSInstructions) || !isVisible) {
    return null;
  }

  const handleDismiss = () => {
    setIsVisible(false);
    // Optionally save to localStorage to prevent showing again
    localStorage.setItem('pwaInstallDismissed', 'true');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-900 dark:text-white">Install GlowAI</h3>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          {showIOSInstructions 
            ? 'Install this app on your iPhone: tap the share icon and then "Add to Home Screen"' 
            : 'Add GlowAI to your home screen for a better experience'}
        </p>
        
        {showInstallPrompt && (
          <Button
            onClick={handleInstallClick}
            className="w-full flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            Install App
          </Button>
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
