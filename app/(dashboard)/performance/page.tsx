'use client';

import { PerformanceTrackerView } from '@/components/PerformanceTrackerView';
import { useEmployees } from '@/features/employees/hooks';

export default function PerformancePage() {
  const { data: employees = [] } = useEmployees();
  return <PerformanceTrackerView employees={employees} />;
}
