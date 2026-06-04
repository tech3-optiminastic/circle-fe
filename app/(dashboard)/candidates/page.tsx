'use client';

import { CandidateListView } from '@/components/CandidateListView';
import { useUiStore } from '@/store/ui-store';
import { useCandidates, useCandidateMutations } from '@/features/candidates/hooks';

export default function CandidatesPage() {
  const { setSelectedCandidateId } = useUiStore();
  const { data: candidates = [] } = useCandidates();
  const { create, remove } = useCandidateMutations();

  return (
    <CandidateListView
      candidates={candidates}
      onSelectCandidate={setSelectedCandidateId}
      onAddCandidate={candidate => create.mutate(candidate)}
      onDeleteCandidate={id => remove.mutate(id)}
    />
  );
}
