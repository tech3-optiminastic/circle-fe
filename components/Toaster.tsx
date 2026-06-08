'use client';

import React from 'react';
import { toast as sonnerToast } from 'sonner';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

/**
 * Non-blocking toast notifications, backed by sonner. The `useToast()` API is
 * preserved so existing call sites (`toast.success/error/info`) are unchanged.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SonnerToaster position="top-right" />
    </>
  );
}

const api: ToastApi = {
  success: message => sonnerToast.success(message),
  error: message => sonnerToast.error(message),
  info: message => sonnerToast.info(message),
};

export function useToast(): ToastApi {
  return api;
}
