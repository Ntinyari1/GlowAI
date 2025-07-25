import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastVariant = 'default' | 'destructive';

interface ToastProps {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastContextType {
  showToast: (props: ToastProps) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<ToastProps | null>(null);

  const showToast = useCallback(({ title, description, variant = 'default' }: ToastProps) => {
    setToast({ title, description, variant });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setToast(null);
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div 
          className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg ${
            toast.variant === 'destructive' 
              ? 'bg-red-100 border border-red-200 text-red-800' 
              : 'bg-white border border-gray-200 text-gray-800'
          }`}
        >
          <h3 className="font-medium">{toast.title}</h3>
          {toast.description && (
            <p className="text-sm mt-1">{toast.description}</p>
          )}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Return a no-op function in case the context is not available
    return {
      showToast: (props: ToastProps) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Toast]', props);
        }
      }
    };
  }
  return context;
}

export function Toaster() {
  return null;
}
