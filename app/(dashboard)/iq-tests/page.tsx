'use client';

import { IQTestAssignmentsView } from '@/components/SubViews';
import { PageLoading } from '@/components/PageLoading';
import { useUiStore } from '@/store/ui-store';
import { useScheduler } from '@/store/schedule-store';
import { useAssignments, useIqTests, useIqTestMutations } from '@/features/assessments/hooks';

export default function IqTestsPage() {
  const { setSelectedCandidateId } = useUiStore();
  const { openSchedule } = useScheduler();
  const { data: iqTests = [], isLoading: l1 } = useIqTests();
  const { data: assignments = [], isLoading: l2 } = useAssignments();
  const { remove } = useIqTestMutations();

  if (l1 || l2) return <PageLoading />;

  return (
    <IQTestAssignmentsView
      iqTests={iqTests}
      assignments={assignments}
      onSelectCandidate={setSelectedCandidateId}
      onShortlistCandidate={(id, name) => openSchedule(id, name, 'Assessment')}
      onDeleteTest={id => remove.mutate(id)}
    />
  );
}
