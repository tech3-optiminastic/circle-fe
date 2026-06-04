'use client';

import { OnboardingChecklistView } from '@/components/SubViews';
import {
  useOnboarding,
  useToggleOnboardingTask,
  usePromoteFromOnboarding,
} from '@/features/onboarding/hooks';

export default function OnboardingPage() {
  const { data: onboarding = [] } = useOnboarding();
  const toggle = useToggleOnboardingTask();
  const promote = usePromoteFromOnboarding();

  return (
    <OnboardingChecklistView
      onboarding={onboarding}
      onToggleTask={(candidateName, taskId) => toggle.mutate({ candidateName, taskId })}
      onAddEmployeeTrigger={checklist => promote.mutate(checklist)}
    />
  );
}
