'use client';

import { useQuery } from '@tanstack/react-query';
import { repositories } from '@/lib/api/repositories';
import { qk } from '@/lib/query/keys';

export function useIqTests() {
  return useQuery({ queryKey: qk.iqTests.all, queryFn: () => repositories.iqTests.list() });
}

export function useAssignments() {
  return useQuery({ queryKey: qk.assignments.all, queryFn: () => repositories.assignments.list() });
}
