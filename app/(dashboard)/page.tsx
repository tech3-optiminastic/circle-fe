'use client';

import { DashboardView } from '@/components/DashboardView';
import { useUiStore } from '@/store/ui-store';
import { useCandidates, useCandidateMutations } from '@/features/candidates/hooks';
import { useInterviews } from '@/features/interviews/hooks';
import { useAssignments, useIqTests } from '@/features/assessments/hooks';

export default function DashboardPage() {
  const { setSelectedCandidateId } = useUiStore();
  const { data: candidates = [] } = useCandidates();
  const { data: interviews = [] } = useInterviews();
  const { data: iqTests = [] } = useIqTests();
  const { data: assignments = [] } = useAssignments();
  const { move } = useCandidateMutations();

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
