'use client';

import { AppraisalsView } from '@/components/SubViews';
import { useEmployees, useEmployeeMutations } from '@/features/employees/hooks';

export default function AppraisalsPage() {
  const { data: employees = [] } = useEmployees();
  const { saveAppraisal } = useEmployeeMutations();
  return <AppraisalsView employees={employees} onSaveReview={review => saveAppraisal.mutate(review)} />;
}
