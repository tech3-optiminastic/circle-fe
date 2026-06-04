import { OnboardingChecklist, OnboardingStatus } from '@/types';

/** Toggle a task and recompute progress + derived onboarding status. */
export function toggleOnboardingTask(checklist: OnboardingChecklist, taskId: string): OnboardingChecklist {
  const tasks = checklist.tasks.map(t => (t.id === taskId ? { ...t, isChecked: !t.isChecked } : t));
  const pct = Math.round((tasks.filter(t => t.isChecked).length / (tasks.length || 1)) * 100);

  let onboardingStatus: OnboardingStatus = checklist.onboardingStatus;
  if (pct === 100) onboardingStatus = 'Onboarding Completed';
  else if (pct >= 60) onboardingStatus = 'Ready to Join';
  else if (pct >= 40) onboardingStatus = 'Documentation Completed';

  return { ...checklist, tasks, progressPercentage: pct, onboardingStatus };
}
