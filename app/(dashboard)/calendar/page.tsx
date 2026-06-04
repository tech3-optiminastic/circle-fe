'use client';

import { CalendarView } from '@/components/CalendarView';
import { PageLoading } from '@/components/PageLoading';
import { useUiStore } from '@/store/ui-store';
import { useCandidates } from '@/features/candidates/hooks';
import { useInterviews } from '@/features/interviews/hooks';
import { useIqTests } from '@/features/assessments/hooks';
import { useSchedules } from '@/features/schedule/hooks';

export default function CalendarPage() {
  const { setSelectedCandidateId } = useUiStore();
  const { data: interviews = [], isLoading: l1 } = useInterviews();
  const { data: iqTests = [], isLoading: l2 } = useIqTests();
  const { data: candidates = [] } = useCandidates();
  const { data: schedules = [], isLoading: l3 } = useSchedules();

  if (l1 || l2 || l3) return <PageLoading />;

  return (
    <CalendarView
      interviews={interviews}
      iqTests={iqTests}
      candidates={candidates}
      schedules={schedules}
      onSelectCandidate={setSelectedCandidateId}
    />
  );
}
