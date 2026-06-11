'use client';

import { useRouter } from 'next/navigation';
import { InterviewsView } from '@/components/SubViews';
import { PageLoading } from '@/components/PageLoading';
import { useToast } from '@/components/Toaster';
import { useScheduler } from '@/store/schedule-store';
import { useCandidates, useCandidateMutations } from '@/features/candidates/hooks';
import { useInterviews, useInterviewMutations } from '@/features/interviews/hooks';
import { sendTestEmail } from '@/lib/api/notifications';

export default function InterviewsPage() {
  const router = useRouter();
  const toast = useToast();
  const { openSchedule } = useScheduler();
  const { data: interviews = [], isLoading } = useInterviews();
  const { data: candidates = [] } = useCandidates();
  const { add, remove } = useInterviewMutations();
  const { move } = useCandidateMutations();

  // Selecting a candidate from the interview marks them selected for the role
  // and emails them to confirm their availability to join.
  const onSelectForRole = (candidateId: string, candidateName: string) => {
    move.mutate({ id: candidateId, status: 'Selected' });
    const cand = candidates.find(c => c.id === candidateId);
    if (!cand?.email) {
      toast.info('Selected, but no email on file — candidate not notified.');
      return;
    }
    sendTestEmail({
      to: cand.email,
      candidateName,
      template: 'offer_selected',
      position: cand.appliedRole || cand.department,
    })
      .then(res => {
        if (res.sent) toast.success(`${candidateName} selected — availability email sent.`);
        else if (res.reason === 'not_configured')
          toast.info('Selected. Email not sent — SMTP is not configured yet.');
        else toast.info('Selected, but the candidate was not emailed.');
      })
      .catch(() => toast.error('Selected, but sending the email failed.'));
  };

  if (isLoading) return <PageLoading />;

  return (
    <InterviewsView
      interviews={interviews}
      candidates={candidates}
      onAddNewInterview={interview => add.mutate(interview)}
      onSelectCandidate={id => router.push(`/candidates/${id}`)}
      onShortlistCandidate={(id, name) => openSchedule(id, name, 'Interview')}
      onDeleteInterview={id => remove.mutate(id)}
      onSelectForRole={onSelectForRole}
    />
  );
}
