'use client';

import React from 'react';
import { CandidateProfileModal } from './CandidateProfileModal';
import { useUiStore } from '@/store/ui-store';
import {
  useCandidates,
  useBgvs,
  useCandidateMutations,
  useUpdateBgv,
  useStartBgv,
} from '@/features/candidates/hooks';
import { useInterviews, useInterviewMutations } from '@/features/interviews/hooks';
import { useIqTests, useAssignments } from '@/features/assessments/hooks';

export function ModalHost() {
  const {
    userRole,
    selectedCandidateId,
    selectedCandidateTab,
    setSelectedCandidateId,
  } = useUiStore();

  const { data: candidates = [] } = useCandidates();
  const { data: interviews = [] } = useInterviews();
  const { data: iqTests = [] } = useIqTests();
  const { data: assignments = [] } = useAssignments();
  const { data: bgvs = [] } = useBgvs();

  const { update: updateCandidate } = useCandidateMutations();
  const updateBgv = useUpdateBgv();
  const startBgv = useStartBgv();
  const { grade, schedule } = useInterviewMutations();

  const candidate = selectedCandidateId ? candidates.find(c => c.id === selectedCandidateId) : null;
  const candidateBgv = selectedCandidateId ? bgvs.find(b => b.candidateId === selectedCandidateId) : null;

  return (
    <>
      {selectedCandidateId && candidate && (
        <CandidateProfileModal
          key={`${selectedCandidateId}-${selectedCandidateTab}`}
          candidate={candidate}
          initialTab={selectedCandidateTab}
          onClose={() => setSelectedCandidateId(null)}
          interviews={interviews}
          iqTests={iqTests}
          assignments={assignments}
          bgv={candidateBgv}
          onUpdateCandidate={updated => updateCandidate.mutate(updated)}
          onUpdateBGV={updated => updateBgv.mutate(updated)}
          onStartBGV={() => startBgv.mutate(candidate)}
          onGradingSubmitted={(interviewId, recommendation, comments) =>
            grade.mutate({ interviewId, recommendation, comments })
          }
          onScheduleInterview={(round, interviewer, dateTime, mode) =>
            schedule.mutate({ candidate, input: { round, interviewer, dateTime, mode } })
          }
          userRole={userRole}
        />
      )}
    </>
  );
}

export default ModalHost;
