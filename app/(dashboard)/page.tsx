'use client';

import { DashboardView } from '@/components/DashboardView';
import { PageLoading } from '@/components/PageLoading';
import { useUiStore } from '@/store/ui-store';
import { useCandidates, useCandidateMutations } from '@/features/candidates/hooks';
import { useInterviews } from '@/features/interviews/hooks';
import { useAssignments, useIqTests } from '@/features/assessments/hooks';

export default function DashboardPage() {
  const { setSelectedCandidateId } = useUiStore();
  const { data: candidates = [] } = useCandidates();
  const { data: interviews = [], isLoading: l1 } = useInterviews();
  const { data: iqTests = [], isLoading: l2 } = useIqTests();
  const { data: assignments = [], isLoading: l3 } = useAssignments();
  const { move } = useCandidateMutations();

  if (l1 || l2 || l3) return <PageLoading />;

  return (
    <DashboardView
      candidates={candidates}
      interviews={interviews}
      iqTests={iqTests}
      assignments={assignments}
      onSelectCandidate={setSelectedCandidateId}
      onMoveCandidate={(id, status) => move.mutate({ id, status })}
    />
  );
}
