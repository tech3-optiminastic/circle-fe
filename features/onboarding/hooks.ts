'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Candidate, OnboardingChecklist } from '@/types';
import { repositories } from '@/lib/api/repositories';
import { qk } from '@/lib/query/keys';
import { optimisticOptions } from '@/lib/query/mutations';
import { toggleOnboardingTask } from '@/services/onboarding.service';
import { buildEmployeeFromCandidate } from '@/services/employee.service';

export function useOnboarding() {
  return useQuery({ queryKey: qk.onboarding.all, queryFn: () => repositories.onboarding.list() });
}

export function useToggleOnboardingTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ candidateName, taskId }: { candidateName: string; taskId: string }) => {
      const list = qc.getQueryData<OnboardingChecklist[]>(qk.onboarding.all) ?? [];
      const target = list.find(o => o.candidateName === candidateName);
      if (!target) return;
      await repositories.onboarding.update(target.candidateId, toggleOnboardingTask(target, taskId));
    },
    ...optimisticOptions<{ candidateName: string; taskId: string }, OnboardingChecklist>(
      qc,
      qk.onboarding.all,
      ({ candidateName, taskId }) =>
        prev =>
          prev.map(o => (o.candidateName === candidateName ? toggleOnboardingTask(o, taskId) : o)),
    ),
  });
}

/** Promote a finished onboarding into a full employee (touches 3 resources). */
export function usePromoteFromOnboarding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (checklist: OnboardingChecklist) => {
      const candidates = qc.getQueryData<Candidate[]>(qk.candidates.all) ?? [];
      const candidate = candidates.find(c => c.id === checklist.candidateId);
      if (!candidate) return;
      await repositories.employees.create(buildEmployeeFromCandidate(candidate));
      await repositories.onboarding.remove(checklist.candidateId);
      await repositories.candidates.patch(checklist.candidateId, { status: 'Shortlisted' });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.employees.all });
      qc.invalidateQueries({ queryKey: qk.onboarding.all });
      qc.invalidateQueries({ queryKey: qk.candidates.all });
    },
  });
}
