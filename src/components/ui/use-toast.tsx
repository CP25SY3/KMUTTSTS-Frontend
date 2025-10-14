'use client';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const toast = ({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
    // Simple console implementation for now
    // In a real app, you'd want to use a proper toast library
    if (variant === 'destructive') {
      console.error(`Toast: ${title}`, description);
    } else {
      console.log(`Toast: ${title}`, description);
    }
  };

  return { toast };
}