'use client';

import { useState } from 'react';
import { CalendarView } from '@/components/CalendarView';
import { GoogleCalendarEmbed } from '@/components/GoogleCalendarEmbed';
import { PageLoading } from '@/components/PageLoading';
import { useUiStore } from '@/store/ui-store';
import { useInterviews } from '@/features/interviews/hooks';
import { useSchedules } from '@/features/schedule/hooks';

type View = 'app' | 'google';

export default function CalendarPage() {
  const [view, setView] = useState<View>('app');
  const { setSelectedCandidateId } = useUiStore();
  const { data: interviews = [], isLoading: l1 } = useInterviews();
  const { data: schedules = [], isLoading: l3 } = useSchedules();

  return (
    <div className="space-y-4 text-xs select-none">
      <div className="flex justify-end">
        <div className="flex shrink-0 overflow-hidden rounded-lg border border-[#DAD4C8] bg-[#F7F4EE] text-xs font-semibold">
          <button
            onClick={() => setView('app')}
            className={`px-3 py-1.5 transition ${
              view === 'app' ? 'bg-accent-50 text-accent-600' : 'text-gray-600 hover:bg-[#E6E1D8]'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setView('google')}
            className={`px-3 py-1.5 transition ${
              view === 'google' ? 'bg-accent-50 text-accent-600' : 'text-gray-600 hover:bg-[#E6E1D8]'
            }`}
          >
            Google
          </button>
        </div>
      </div>

      {view === 'google' ? (
        <GoogleCalendarEmbed />
      ) : l1 || l3 ? (
        <PageLoading />
      ) : (
        <CalendarView
          interviews={interviews}
          schedules={schedules}
          onSelectCandidate={setSelectedCandidateId}
        />
      )}
    </div>
  );
}
