'use client';

import { OffboardingChecklistView } from '@/components/SubViews';
import { PageLoading } from '@/components/PageLoading';
import {
  useOffboarding,
  useToggleExitTask,
  useToggleDeliverable,
  useConfirmClearance,
} from '@/features/offboarding/hooks';

export default function OffboardingPage() {
  const { data: offboarding = [], isLoading } = useOffboarding();
  const toggle = useToggleExitTask();
  const toggleDeliverable = useToggleDeliverable();
  const confirm = useConfirmClearance();

  if (isLoading) return <PageLoading />;

  return (
    <OffboardingChecklistView
      offboarding={offboarding}
      onToggleExitTask={(empId, taskId) => toggle.mutate({ empId, taskId })}
      onToggleDeliverable={(empId, deliverableId) => toggleDeliverable.mutate({ empId, deliverableId })}
      onConfirmClearance={empId => confirm.mutate(empId)}
    />
  );
}
