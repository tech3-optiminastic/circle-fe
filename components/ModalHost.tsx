'use client';

import React from 'react';
import { CandidateProfileModal } from './CandidateProfileModal';
import { EmployeeProfileModal } from './EmployeeProfileModal';
import { useUiStore } from '@/store/ui-store';
import { useCandidates, useBgvs, useCandidateMutations, useUpdateBgv } from '@/features/candidates/hooks';
import { useEmployees } from '@/features/employees/hooks';
import { useInterviews, useInterviewMutations } from '@/features/interviews/hooks';
import { useIqTests, useAssignments } from '@/features/assessments/hooks';
import { useInitiateOffboarding } from '@/features/offboarding/hooks';

export function ModalHost() {
  const { userRole, selectedCandidateId, selectedEmployeeId, setSelectedCandidateId, setSelectedEmployeeId } =
    useUiStore();

  const { data: candidates = [] } = useCandidates();
  const { data: employees = [] } = useEmployees();
  const { data: interviews = [] } = useInterviews();
  const { data: iqTests = [] } = useIqTests();
  const { data: assignments = [] } = useAssignments();
  const { data: bgvs = [] } = useBgvs();

  const { update: updateCandidate } = useCandidateMutations();
  const updateBgv = useUpdateBgv();
  const { grade, schedule } = useInterviewMutations();
  const initiateOffboarding = useInitiateOffboarding();

  const candidate = selectedCandidateId ? candidates.find(c => c.id === selectedCandidateId) : null;
  const candidateBgv = selectedCandidateId ? bgvs.find(b => b.candidateId === selectedCandidateId) : null;
  const employee = selectedEmployeeId ? employees.find(e => e.id === selectedEmployeeId) : null;

  return (
    <>
      {selectedCandidateId && candidate && (
        <CandidateProfileModal
          candidate={candidate}
          onClose={() => setSelectedCandidateId(null)}
          interviews={interviews}
          iqTests={iqTests}
          assignments={assignments}
          bgv={candidateBgv}
          onUpdateCandidate={updated => updateCandidate.mutate(updated)}
          onUpdateBGV={updated => updateBgv.mutate(updated)}
          onGradingSubmitted={(interviewId, recommendation, comments) =>
            grade.mutate({ interviewId, recommendation, comments })
          }
          onScheduleInterview={(round, interviewer, dateTime, mode) =>
            schedule.mutate({ candidate, input: { round, interviewer, dateTime, mode } })
          }
          userRole={userRole}
        />
      )}

      {selectedEmployeeId && employee && (
        <EmployeeProfileModal
          employee={employee}
          onClose={() => setSelectedEmployeeId(null)}
          onInitiateOffboarding={(empId, reason) => initiateOffboarding.mutate({ empId, reason })}
        />
      )}
    </>
  );
}

export default ModalHost;
