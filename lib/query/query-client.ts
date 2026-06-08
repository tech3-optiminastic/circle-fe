import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/http/client';

/** Factory so the server and client never share a QueryClient instance. */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Mutations invalidate their own queries, so cached data can stay
        // fresh for longer — navigation then renders instantly from cache.
        staleTime: 120_000,
        gcTime: 15 * 60_000,
        refetchOnWindowFocus: false,
        // Don't retry client errors (4xx); retry transient ones up to twice.
        retry: (failureCount, error) =>
          !(error instanceof ApiError && error.status < 500) && failureCount < 2,
      },
    },
  });
}
