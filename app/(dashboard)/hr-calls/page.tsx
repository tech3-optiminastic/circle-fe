'use client';

import { IntroductoryCallsView } from '@/components/SubViews';
import { useUiStore } from '@/store/ui-store';
import { useCandidates, useCandidateMutations } from '@/features/candidates/hooks';

export default function HrCallsPage() {
  const { setSelectedCandidateId } = useUiStore();
  const { data: candidates = [] } = useCandidates();
  const { update } = useCandidateMutations();

  return (
    <IntroductoryCallsView
      candidates={candidates}
      onSelectCandidate={setSelectedCandidateId}
      onUpdateCandidate={updated => update.mutate(updated)}
    />
  );
}
