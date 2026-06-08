/**
 * Workspace configuration — sourced from env (set in .env.local), not hardcoded.
 * Leave the env vars unset to show blank fields instead of placeholder identity.
 */
export const workspace = {
  name: process.env.NEXT_PUBLIC_WORKSPACE_NAME ?? '',
  domain: process.env.NEXT_PUBLIC_WORKSPACE_DOMAIN ?? '',
};
