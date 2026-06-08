'use client';

import { EmployeeDirectoryView } from '@/components/SubViews';
import { useUiStore } from '@/store/ui-store';
import { useEmployees, useEmployeeMutations } from '@/features/employees/hooks';

export default function DirectoryPage() {
  const { setSelectedEmployeeId } = useUiStore();
  const { data: employees = [] } = useEmployees();
  const { create, update } = useEmployeeMutations();

  return (
    <EmployeeDirectoryView
      employees={employees}
      onSelectEmployee={setSelectedEmployeeId}
      onUpdateEmployee={updated => update.mutate(updated)}
      onAddEmployee={employee => create.mutate(employee)}
    />
  );
}
