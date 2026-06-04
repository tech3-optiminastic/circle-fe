'use client';

import { InterviewsView } from '@/components/SubViews';
import { useCandidates } from '@/features/candidates/hooks';
import { useInterviews, useInterviewMutations } from '@/features/interviews/hooks';

export default function InterviewsPage() {
  const { data: interviews = [] } = useInterviews();
  const { data: candidates = [] } = useCandidates();
  const { add } = useInterviewMutations();

  return (
    <InterviewsView
      interviews={interviews}
      candidates={candidates}
      onAddNewInterview={interview => add.mutate(interview)}
    />
  );
}
