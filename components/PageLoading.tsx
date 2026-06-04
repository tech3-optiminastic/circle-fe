'use client';

/**
 * Full-area loading indicator shown while a page's queries are still fetching.
 * Prevents the "empty state flashes, then data pops in" effect — pages should
 * render this until their data has actually arrived.
 */
export function PageLoading() {
  return (
    <div className="flex items-center justify-center h-full min-h-[320px]">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <div className="w-6 h-6 border-2 border-accent-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono">Loading…</span>
      </div>
    </div>
  );
}

export default PageLoading;
