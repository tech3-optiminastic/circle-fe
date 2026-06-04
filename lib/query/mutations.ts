import { QueryClient } from '@tanstack/react-query';
import { applyOptimistic, ListSnapshot, rollback } from './optimistic';

/**
 * Builds the onMutate/onError/onSettled trio for an optimistic list mutation:
 * snapshot + optimistic write, rollback on error, invalidate on settle.
 */
export function optimisticOptions<TVars, T>(
  qc: QueryClient,
  key: readonly unknown[],
  updater: (vars: TVars) => (prev: T[]) => T[],
  invalidate: readonly (readonly unknown[])[] = [key],
) {
  return {
    onMutate: async (vars: TVars): Promise<{ snap: ListSnapshot<T> }> => ({
      snap: await applyOptimistic<T>(qc, key, updater(vars)),
    }),
    onError: (_err: unknown, _vars: TVars, ctx: { snap: ListSnapshot<T> } | undefined) =>
      rollback(qc, ctx?.snap),
    onSettled: () => invalidate.forEach(k => qc.invalidateQueries({ queryKey: k })),
  };
}
