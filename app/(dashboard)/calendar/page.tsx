'use client';

import { CalendarView } from '@/components/CalendarView';
import { useUiStore } from '@/store/ui-store';
import { useCandidates } from '@/features/candidates/hooks';
import { useInterviews } from '@/features/interviews/hooks';
import { useIqTests } from '@/features/assessments/hooks';

export default function CalendarPage() {
  const { setSelectedCandidateId } = useUiStore();
  const { data: interviews = [] } = useInterviews();
  const { data: iqTests = [] } = useIqTests();
  const { data: candidates = [] } = useCandidates();

  return (
    <CalendarView
      interviews={interviews}
      iqTests={iqTests}
      candidates={candidates}
      onSelectCandidate={setSelectedCandidateId}
    />
  );
}
