'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ClipboardList,
  Loader2,
  XCircle,
  CheckCircle2,
  CalendarClock,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { TestInvite } from '@/types';
import { repositories } from '@/lib/api/repositories';
import { qk } from '@/lib/query/keys';
import { uploadDocument, importDriveDocument } from '@/lib/api/documents';
import { FileDropzone, PickedFile } from '@/components/ui/file-dropzone';
import { nowISO } from '@/lib/utils';

function fmtDeadline(iso?: string): string {
  if (!iso) return 'No deadline set';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AssignmentSubmissionPage() {
  const params = useParams<{ inviteId: string }>();
  const inviteId = params?.inviteId ?? '';

  const { data: invite, isLoading, isError } = useQuery({
    queryKey: qk.testInvites.detail(inviteId),
    queryFn: () => repositories.testInvites.get(inviteId),
    enabled: Boolean(inviteId),
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <Frame>
        <div className="flex flex-col items-center gap-4 py-16 text-gray-500">
          <Loader2 size={28} className="animate-spin text-accent-600" />
          <p className="text-sm font-medium">Loading your assignment…</p>
        </div>
      </Frame>
    );
  }

  if (isError || !invite || invite.kind !== 'assignment') {
    return (
      <Frame>
        <div className="flex flex-col items-center gap-4 py-14 text-center px-6">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-red-50 text-red-500 ring-8 ring-red-50/40">
            <XCircle size={30} />
          </span>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Assignment link not found</h1>
            <p className="mt-1.5 max-w-sm text-sm text-gray-500">
              This assignment link is invalid or has been removed. Please contact the HR team if you
              believe this is a mistake.
            </p>
          </div>
        </div>
      </Frame>
    );
  }

  return <AssignmentFlow invite={invite} />;
}

function AssignmentFlow({ invite }: { invite: TestInvite }) {
  const alreadyDone =
    invite.status === 'Submitted' || invite.status === 'Graded' || invite.status === 'Completed';
  const [picked, setPicked] = useState<PickedFile | null>(null);
  const [phase, setPhase] = useState<'brief' | 'submitting' | 'done'>(alreadyDone ? 'done' : 'brief');
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!picked) {
      setError('Please attach your work before submitting.');
      return;
    }
    setError(null);
    setPhase('submitting');
    try {
      const doc =
        picked.kind === 'local'
          ? await uploadDocument({
              entityType: 'candidate',
              entityId: invite.candidateId,
              category: 'assignment',
              file: picked.file,
            })
          : await importDriveDocument({
              entityType: 'candidate',
              entityId: invite.candidateId,
              category: 'assignment',
              fileId: picked.ref.id,
              fileName: picked.ref.name,
              mimeType: picked.ref.mimeType,
              accessToken: picked.ref.accessToken,
            });
      await repositories.testInvites.patch(invite.id, {
        status: 'Submitted',
        submissionDocId: doc.id,
        submissionFileName: doc.fileName,
        completedAt: nowISO(),
      });
      setPhase('done');
    } catch {
      setError('Submission failed — please try again.');
      setPhase('brief');
    }
  };

  if (phase === 'done') {
    return (
      <Frame>
        <div className="flex flex-col items-center gap-5 px-6 py-12 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-100">
            <CheckCircle2 size={30} />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assignment submitted</h1>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-gray-500">
              Thanks, {invite.candidateName.split(' ')[0]} — your work has been received. Our team
              will review it and get back to you about the next step (an interview).
            </p>
          </div>
          {invite.submissionFileName && (
            <div className="w-full max-w-sm rounded-2xl border border-[#E2DCCF] bg-[#F2EEE7] px-5 py-3.5 text-sm text-gray-600">
              Submitted file: <span className="font-medium text-gray-800">{invite.submissionFileName}</span>
            </div>
          )}
        </div>
      </Frame>
    );
  }

  if (phase === 'submitting') {
    return (
      <Frame>
        <div className="flex flex-col items-center gap-4 py-16 text-gray-500">
          <Loader2 size={28} className="animate-spin text-accent-600" />
          <p className="text-sm font-medium">Uploading your submission…</p>
        </div>
      </Frame>
    );
  }

  return (
    <Frame>
      <div className="space-y-6 px-6 py-8 sm:px-8">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-accent-50 to-accent-100 text-accent-600 ring-1 ring-accent-200/60">
            <ClipboardList size={24} />
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">
              {invite.position || invite.department} Assignment
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Hi <span className="font-semibold text-gray-700">{invite.candidateName}</span> — here&apos;s
              your take-home assignment.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-[#E2DCCF] bg-[#F2EEE7] px-4 py-3 text-sm">
          <CalendarClock size={16} className="text-accent-600" />
          <span className="text-gray-600">Submit by</span>
          <span className="font-semibold text-gray-800">{fmtDeadline(invite.deadlineIso)}</span>
        </div>

        <div className="rounded-2xl border border-[#E2DCCF] bg-white/70 p-5">
          <p className="mb-2 text-sm font-bold text-gray-900">Brief</p>
          <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-gray-600">
            {invite.instructions || 'Complete the task and upload your work below.'}
          </pre>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-gray-900">
            <UploadCloud size={16} className="text-accent-600" /> Your submission
          </p>
          <FileDropzone
            value={picked}
            onChange={setPicked}
            accept=".pdf,.zip,.doc,.docx,.ppt,.pptx,.fig"
            hint="PDF, ZIP, DOC, PPT up to 15 MB"
          />
          {error && <p className="mt-2 text-[12px] font-medium text-red-500">{error}</p>}
        </div>

        <button
          onClick={submit}
          disabled={!picked}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent-600 to-accent-700 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
        >
          Submit assignment
        </button>
      </div>
    </Frame>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-[#EFEBE3] to-[#E4DED4]">
      <div aria-hidden className="pointer-events-none absolute -top-32 -right-24 h-80 w-80 rounded-full bg-accent-600/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-accent-800/10 blur-3xl" />

      <header className="relative z-10 flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 text-white shadow-sm">
            <Logo size={20} />
          </span>
          <div>
            <p className="text-sm font-bold leading-tight text-gray-900">Curcle</p>
            <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-gray-500">
              Recruitment Portal
            </p>
          </div>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full border border-[#DAD4C8] bg-white/60 px-3 py-1 text-[10px] font-semibold text-gray-600 sm:inline-flex">
          <ShieldCheck size={12} className="text-accent-600" /> Secure
        </span>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-6">
        <div className="relative overflow-hidden rounded-3xl border border-[#E2DCCF] bg-[#FBFAF7] shadow-[0_20px_50px_-20px_rgba(95,15,22,0.25)]">
          <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-accent-400 via-accent-600 to-accent-800" />
          {children}
        </div>
      </main>

      <footer className="relative z-10 py-5 text-center font-mono text-[10px] text-gray-500">
        Curcle HRMS · Candidate assignment
      </footer>
    </div>
  );
}
