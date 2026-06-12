'use client';

import { useRouter } from 'next/navigation';
import { EmployeeDirectoryView } from '@/components/SubViews';
import { useEmployees, useEmployeeMutations } from '@/features/employees/hooks';

export default function DirectoryPage() {
  const router = useRouter();
  const { data: employees = [] } = useEmployees();
  const { create, update } = useEmployeeMutations();

  return (
    <EmployeeDirectoryView
      employees={employees}
      onSelectEmployee={id => router.push(`/employees/${id}`)}
      onUpdateEmployee={updated => update.mutate(updated)}
      onAddEmployee={employee => create.mutate(employee)}
    />
  );
}
