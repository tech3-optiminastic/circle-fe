'use client';

import React, { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@/lib/query/query-client';
import { UiStateProvider } from '@/store/ui-store';

/** Composition of client-side providers: server-state (Query) + UI state. */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <UiStateProvider>{children}</UiStateProvider>
    </QueryClientProvider>
  );
}
