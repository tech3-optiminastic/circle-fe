import { QueryClient } from '@tanstack/react-query';

/**
 * Reusable optimistic-update helpers for list queries. A mutation's `onMutate`
 * snapshots + optimistically writes; `onError` rolls back; `onSettled` invalidates.
 * Centralizing this keeps every mutation hook small and consistent.
 */

export type ListSnapshot<T> = { key: readonly unknown[]; previous: T[] | undefined };

export async function applyOptimistic<T>(
  qc: QueryClient,
  key: readonly unknown[],
  updater: (prev: T[]) => T[],
): Promise<ListSnapshot<T>> {
  await qc.cancelQueries({ queryKey: key });
  const previous = qc.getQueryData<T[]>(key);
  qc.setQueryData<T[]>(key, old => updater(old ?? []));
  return { key, previous };
}

export function rollback<T>(qc: QueryClient, snapshot?: ListSnapshot<T>): void {
  if (snapshot && snapshot.previous !== undefined) {
    qc.setQueryData(snapshot.key, snapshot.previous);
  }
}

/** Common list updaters. */
export const listOps = {
  prepend:
    <T>(item: T) =>
    (prev: T[]) => [item, ...prev],
  replaceBy:
    <T>(match: (x: T) => boolean, item: T) =>
    (prev: T[]) =>
      prev.map(x => (match(x) ? item : x)),
  mergeBy:
    <T>(match: (x: T) => boolean, changes: Partial<T>) =>
    (prev: T[]) =>
      prev.map(x => (match(x) ? { ...x, ...changes } : x)),
  removeBy:
    <T>(match: (x: T) => boolean) =>
    (prev: T[]) =>
      prev.filter(x => !match(x)),
};
