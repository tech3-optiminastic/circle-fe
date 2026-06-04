'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';

/**
 * Client-only UI state — deliberately separate from server state (TanStack Query).
 * Holds the access-role switch, global search text, and which entity drawer is open.
 */

export type UserRole = 'HR' | 'Admin';

interface UiState {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCandidateId: string | null;
  setSelectedCandidateId: (id: string | null) => void;
  selectedEmployeeId: string | null;
  setSelectedEmployeeId: (id: string | null) => void;
}

const UiStateContext = createContext<UiState | null>(null);

export function UiStateProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>('HR');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const value = useMemo<UiState>(
    () => ({
      userRole,
      setUserRole,
      searchQuery,
      setSearchQuery,
      selectedCandidateId,
      setSelectedCandidateId,
      selectedEmployeeId,
      setSelectedEmployeeId,
    }),
    [userRole, searchQuery, selectedCandidateId, selectedEmployeeId],
  );

  return <UiStateContext.Provider value={value}>{children}</UiStateContext.Provider>;
}

export function useUiStore(): UiState {
  const ctx = useContext(UiStateContext);
  if (!ctx) throw new Error('useUiStore must be used within a UiStateProvider');
  return ctx;
}
