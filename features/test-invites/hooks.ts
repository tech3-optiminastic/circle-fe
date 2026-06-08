'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TestInvite } from '@/types';
import { repositories } from '@/lib/api/repositories';
import { qk } from '@/lib/query/keys';

export function useTestInvites() {
  return useQuery({
    queryKey: qk.testInvites.all,
    queryFn: () => repositories.testInvites.list(),
  });
}

export function useTestInviteMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: qk.testInvites.all });

  const remove = useMutation({
    mutationFn: (id: string) => repositories.testInvites.remove(id),
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: qk.testInvites.all });
      const prev = qc.getQueryData<TestInvite[]>(qk.testInvites.all);
      qc.setQueryData<TestInvite[]>(qk.testInvites.all, old =>
        (old ?? []).filter(t => t.id !== id),
      );
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.testInvites.all, ctx.prev);
    },
    onSettled: invalidate,
  });

  return { remove };
}
