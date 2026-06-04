'use client';

import { CommunicationView } from '@/components/CommunicationView';
import { useEmployees, useEmployeeMutations } from '@/features/employees/hooks';

export default function CommunicationPage() {
  const { data: employees = [] } = useEmployees();
  const { update } = useEmployeeMutations();

  return (
    <CommunicationView
      employees={employees}
      onRate={(employee, rating) => update.mutate({ ...employee, communicationRating: rating })}
    />
  );
}
