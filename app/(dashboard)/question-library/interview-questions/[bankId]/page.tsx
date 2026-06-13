'use client';

import { useParams } from 'next/navigation';
import { InterviewQuestionEditor } from '@/components/InterviewQuestionEditor';

export default function InterviewBankPage() {
  const params = useParams<{ bankId: string }>();
  return <InterviewQuestionEditor bankId={params?.bankId ?? ''} />;
}
