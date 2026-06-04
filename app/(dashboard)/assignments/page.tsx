'use client';

import { IQTestAssignmentsView } from '@/components/SubViews';
import { PageLoading } from '@/components/PageLoading';
import { useAssignments, useIqTests } from '@/features/assessments/hooks';

export default function AssignmentsPage() {
  const { data: iqTests = [], isLoading: l1 } = useIqTests();
  const { data: assignments = [], isLoading: l2 } = useAssignments();
  if (l1 || l2) return <PageLoading />;
  return <IQTestAssignmentsView iqTests={iqTests} assignments={assignments} />;
}
