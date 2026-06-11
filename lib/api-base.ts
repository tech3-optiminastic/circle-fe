/**
 * Resolve the backend API origin.
 *
 * Priority:
 *  1. `NEXT_PUBLIC_API_URL` if explicitly set (prod / custom setups).
 *  2. Otherwise derive it from the page's own hostname, so the app works when
 *     opened over the LAN / on a phone — there `localhost` would point at the
 *     device itself, not the dev machine. The API is assumed to run on the same
 *     host, port 8000 (override with `NEXT_PUBLIC_API_PORT`).
 *  3. SSR fallback: localhost.
 *
 * Evaluated at call time (not module load) so `window` is available in the browser.
 */
const API_PORT = process.env.NEXT_PUBLIC_API_PORT || '8000';

export function apiBase(): string {
  const explicit = process.env.NEXT_PUBLIC_API_URL;
  if (explicit) return explicit.replace(/\/$/, '');
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:${API_PORT}`;
  }
  return `http://localhost:${API_PORT}`;
}
