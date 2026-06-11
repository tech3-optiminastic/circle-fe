'use client';

import { HiringFunnelChart } from '@/components/HiringFunnelChart';
import { PageLoading } from '@/components/PageLoading';
import { BRAND } from '@/lib/brand';
import { useCandidates } from '@/features/candidates/hooks';
import { useInterviews } from '@/features/interviews/hooks';

export default function ReportsPage() {
  const { data: candidates = [] } = useCandidates();
  const { data: interviews = [], isLoading } = useInterviews();

  if (isLoading) return <PageLoading />;

  return (
    <div className="space-y-6">
      <h2 className="text-sm font-bold text-gray-900 tracking-tight font-display">
        {BRAND.name} Enterprise Reports Dashboard
      </h2>
      <p className="text-xs text-gray-500">
        Yield convert charts, time-to-hire averages, promotion trends, and offboarding completion scorecards.
      </p>
      <div className="bg-[#F7F4EE] border border-[#DAD4C8] rounded-xl p-5">
        <HiringFunnelChart candidates={candidates} interviews={interviews} />
      </div>
    </div>
  );
}
