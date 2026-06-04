'use client';

import { IQTestAssignmentsView } from '@/components/SubViews';
import { useAssignments, useIqTests } from '@/features/assessments/hooks';

export default function AssignmentsPage() {
  const { data: iqTests = [] } = useIqTests();
  const { data: assignments = [] } = useAssignments();
  return <IQTestAssignmentsView iqTests={iqTests} assignments={assignments} />;
}
