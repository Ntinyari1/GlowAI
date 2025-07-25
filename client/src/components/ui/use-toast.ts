import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastVariant = 'default' | 'destructive';

interface ToastProps {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toast: (props: ToastProps) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

// Simple toast implementation that logs to console in development
export function ToastProvider({ children }: ToastProviderProps) {
  const toast = useCallback(({ title, description, variant = 'default' }: ToastProps) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${variant}] ${title}`, description || '');
    }
    // In production, this would show a toast notification
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    // Return a no-op function in case the context is not available
    return {
      toast: (props: ToastProps) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('useToast used outside of ToastProvider', props);
        }
      }
    };
  }
  return context;
}

export function Toaster() {
  return null;
}
