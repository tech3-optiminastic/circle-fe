'use client';

import { OnboardingChecklistView } from '@/components/SubViews';
import { PageLoading } from '@/components/PageLoading';
import {
  useOnboarding,
  useToggleOnboardingTask,
  usePromoteFromOnboarding,
} from '@/features/onboarding/hooks';

export default function OnboardingPage() {
  const { data: onboarding = [], isLoading } = useOnboarding();
  const toggle = useToggleOnboardingTask();
  const promote = usePromoteFromOnboarding();

  if (isLoading) return <PageLoading />;

  return (
    <OnboardingChecklistView
      onboarding={onboarding}
      onToggleTask={(candidateName, taskId) => toggle.mutate({ candidateName, taskId })}
      onAddEmployeeTrigger={checklist => promote.mutate(checklist)}
    />
  );
}
