'use client';

import React from 'react';
import { toast as sonnerToast } from 'sonner';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';

interface ConfirmOptions {
  /** Headline question, e.g. "Delete this posting?". */
  title: string;
  /** Optional supporting line, e.g. "This cannot be undone.". */
  description?: string;
  /** Action button label (default "Confirm"). */
  confirmLabel?: string;
  /** Runs when the user confirms. */
  onConfirm: () => void;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  /** Inline confirmation toast (replaces window.confirm). Nothing happens
   *  unless the user clicks the action — the safe default for destructive ops. */
  confirm: (options: ConfirmOptions) => void;
}

/**
 * Non-blocking toast notifications, backed by sonner. The `useToast()` API is
 * preserved so existing call sites (`toast.success/error/info`) are unchanged.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SonnerToaster position="bottom-right" />
    </>
  );
}

const api: ToastApi = {
  success: message => sonnerToast.success(message),
  error: message => sonnerToast.error(message),
  info: message => sonnerToast.info(message),
  confirm: ({ title, description, confirmLabel = 'Confirm', onConfirm }) =>
    sonnerToast(title, {
      description,
      duration: 10000,
      action: { label: confirmLabel, onClick: onConfirm },
      cancel: { label: 'Cancel', onClick: () => {} },
    }),
};

export function useToast(): ToastApi {
  return api;
}
