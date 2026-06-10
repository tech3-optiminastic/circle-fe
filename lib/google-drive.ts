'use client';

/**
 * Google Drive Picker — lets the user pick a file from their Drive and returns
 * a short-lived OAuth access token (drive.readonly) plus the file reference.
 * The backend uses the token once to pull a copy into our own storage; nothing
 * Drive-related is persisted on the client.
 *
 * Requires two public env vars (set in .env.local):
 *   NEXT_PUBLIC_GOOGLE_CLIENT_ID  — the OAuth 2.0 "Web application" client id
 *   NEXT_PUBLIC_GOOGLE_API_KEY    — a Google API key with the Picker API enabled
 * When either is missing, `isDriveConfigured` is false and callers hide the UI.
 */

import { useCallback, useState } from 'react';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? '';
const SCOPE = 'https://www.googleapis.com/auth/drive.readonly';

export const isDriveConfigured = Boolean(CLIENT_ID && API_KEY);

export interface DriveFileRef {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  accessToken: string;
}

// The Google scripts attach to window; we keep the typing loose on purpose.
/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    gapi?: any;
    google?: any;
  }
}

const loaded = new Set<string>();

function loadScript(src: string): Promise<void> {
  if (loaded.has(src)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src;
    el.async = true;
    el.onload = () => {
      loaded.add(src);
      resolve();
    };
    el.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(el);
  });
}

async function ensurePickerLoaded(): Promise<void> {
  await loadScript('https://apis.google.com/js/api.js');
  await new Promise<void>((resolve) => window.gapi.load('picker', () => resolve()));
}

function requestAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      callback: (resp: any) =>
        resp?.access_token ? resolve(resp.access_token) : reject(new Error('No access token returned')),
      error_callback: (err: any) => reject(new Error(err?.message || 'Google sign-in was cancelled')),
    });
    client.requestAccessToken({ prompt: '' });
  });
}

function showPicker(accessToken: string): Promise<DriveFileRef | null> {
  return new Promise((resolve) => {
    const { google } = window;
    const view = new google.picker.DocsView(google.picker.ViewId.DOCS)
      .setIncludeFolders(false)
      .setSelectFolderEnabled(false)
      .setMode(google.picker.DocsViewMode.LIST);

    const picker = new google.picker.PickerBuilder()
      .setOAuthToken(accessToken)
      .setDeveloperKey(API_KEY)
      .addView(view)
      .setCallback((data: any) => {
        if (data.action === google.picker.Action.PICKED) {
          const doc = data.docs?.[0];
          resolve(
            doc
              ? {
                  id: doc.id,
                  name: doc.name,
                  mimeType: doc.mimeType,
                  sizeBytes: Number(doc.sizeBytes ?? 0),
                  accessToken,
                }
              : null,
          );
        } else if (data.action === google.picker.Action.CANCEL) {
          resolve(null);
        }
      })
      .build();
    picker.setVisible(true);
  });
}

export function useGoogleDrivePicker() {
  const [loading, setLoading] = useState(false);

  const pick = useCallback(async (): Promise<DriveFileRef | null> => {
    if (!isDriveConfigured) throw new Error('Google Drive is not configured.');
    setLoading(true);
    try {
      await Promise.all([
        loadScript('https://accounts.google.com/gsi/client'),
        ensurePickerLoaded(),
      ]);
      const token = await requestAccessToken();
      return await showPicker(token);
    } finally {
      setLoading(false);
    }
  }, []);

  return { pick, loading, configured: isDriveConfigured };
}
