'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  FileSignature,
  PenLine,
  Building2,
  ScrollText,
  Fingerprint,
  BadgeCheck,
  Check,
  Send,
  Loader2,
  Lock,
} from 'lucide-react';
import { BGVRequirement, OnboardingChecklist } from '@/types';
import { useCandidates, useBgvs, useUpdateBgv, useStartBgv } from '@/features/candidates/hooks';
import { useDocRequests } from '@/features/doc-requests/hooks';
import {
  useOnboardingEmails,
  usePromoteFromOnboarding,
  OnboardingEmailKind,
} from '@/features/onboarding/hooks';
import { nowISO } from '@/lib/utils';
import { useToast } from '@/components/Toaster';
import {
  Stepper,
  StepperNav,
  StepperItem,
  StepperIndicator,
  StepperTitle,
  StepperDescription,
} from '@/components/ui/stepper';

interface OnboardingStepperProps {
  checklist: OnboardingChecklist;
}

type StageAction =
  | { kind: 'email'; emailKind: OnboardingEmailKind; cta: string }
  | { kind: 'mark-signed'; cta: string }
  | { kind: 'start-bgv'; cta: string }
  | { kind: 'verify-bgv'; cta: string }
  | { kind: 'convert-employee'; cta: string }
  | { kind: 'none' };

type StepState = 'done' | 'current' | 'todo';

const fmtDateTime = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

export function OnboardingStepper({ checklist }: OnboardingStepperProps) {
  const toast = useToast();
  const { data: candidates = [] } = useCandidates();
  const { data: requests = [] } = useDocRequests();
  const { data: bgvs = [] } = useBgvs();
  const { send, markOfferSigned } = useOnboardingEmails();
  const updateBgv = useUpdateBgv();
  const startBgv = useStartBgv();
  const promote = usePromoteFromOnboarding();

  const [picked, setPicked] = useState<number | null>(null);

  const candidate = candidates.find(c => c.id === checklist.candidateId);
  const docRequest = requests
    .filter(r => r.candidateId === checklist.candidateId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  const bgv = bgvs.find(b => b.candidateId === checklist.candidateId);

  const verifiedCount = docRequest?.submissions?.filter(s => s.status === 'Verified').length ?? 0;
  const requiredCount = docRequest?.requiredDocs?.length ?? 0;
  const docsVerified = docRequest?.status === 'Verified';
  const bgvVerified = bgv?.overallStatus === 'Verified';
  const joined =
    checklist.progressPercentage === 100 ||
    checklist.onboardingStatus === 'Joined' ||
    checklist.onboardingStatus === 'Onboarding Completed';

  const stages: {
    Icon: typeof ShieldCheck;
    label: string;
    done: boolean;
    desc: string;
    at?: string;
    detail: string;
    action: StageAction;
  }[] = [
    {
      Icon: ShieldCheck,
      label: 'Documents verified',
      done: docsVerified,
      desc: docsVerified ? 'Verified' : docRequest ? `${verifiedCount}/${requiredCount} verified` : 'Pending',
      detail: docsVerified
        ? 'All joining documents have been verified.'
        : docRequest
          ? `${verifiedCount} of ${requiredCount} documents verified. Finish verifying the uploads below before sending the offer.`
          : 'No documents collected yet — request and verify them in the panel below.',
      action: { kind: 'none' },
    },
    {
      Icon: FileSignature,
      label: 'Offer letter',
      done: Boolean(checklist.offerLetterSentAt),
      desc: checklist.offerLetterSentAt ? 'Sent' : 'Pending',
      at: checklist.offerLetterSentAt,
      detail:
        'Email the candidate their offer letter to review. They are asked to sign it and send the signed copy back.',
      action: { kind: 'email', emailKind: 'offer_letter', cta: 'offer letter' },
    },
    {
      Icon: PenLine,
      label: 'Signed offer received',
      done: Boolean(checklist.offerSignedReceivedAt),
      desc: checklist.offerSignedReceivedAt ? 'Received' : 'Awaiting',
      at: checklist.offerSignedReceivedAt,
      detail:
        'Once the candidate returns the signed offer, mark it received here to unlock the office invite.',
      action: { kind: 'mark-signed', cta: 'Mark received' },
    },
    {
      Icon: Building2,
      label: 'Office invite',
      done: Boolean(checklist.officeInviteSentAt),
      desc: checklist.officeInviteSentAt ? 'Sent' : 'Pending',
      at: checklist.officeInviteSentAt,
      detail: 'Send a welcome-to-office email with the office address so they can visit and complete formalities.',
      action: { kind: 'email', emailKind: 'office_invite', cta: 'office invite' },
    },
    {
      Icon: ScrollText,
      label: 'Letter of appointment',
      done: Boolean(checklist.appointmentLetterSentAt),
      desc: checklist.appointmentLetterSentAt ? 'Sent' : 'Pending',
      at: checklist.appointmentLetterSentAt,
      detail: 'A few days after the office visit, send the formal letter of appointment confirming their role.',
      action: { kind: 'email', emailKind: 'appointment_letter', cta: 'appointment letter' },
    },
    {
      Icon: Fingerprint,
      label: 'Background verification',
      done: bgvVerified,
      desc: bgv ? bgv.overallStatus : 'Not started',
      detail: bgvVerified
        ? 'Background verification is cleared.'
        : bgv
          ? `Background check is "${bgv.overallStatus}". Mark it verified once all checks pass to enable employee conversion.`
          : 'Background verification has not started yet. Kick it off to begin collecting & checking documents.',
      action: bgv
        ? { kind: 'verify-bgv', cta: 'Mark BGV verified' }
        : { kind: 'start-bgv', cta: 'Start BGV' },
    },
    {
      Icon: BadgeCheck,
      label: 'Employee',
      done: joined,
      desc: joined ? 'Onboarded' : 'Pending',
      detail: joined
        ? 'The candidate has been onboarded into the employee directory.'
        : 'Once background verification is cleared, convert the candidate into an employee. This is the final step.',
      action: { kind: 'convert-employee', cta: 'Convert to employee' },
    },
  ];

  // First not-yet-done stage is "current"; everything before it is done.
  const firstOpen = stages.findIndex(s => !s.done);
  const currentIndex = firstOpen === -1 ? stages.length - 1 : firstOpen;
  const activeStage = picked ?? currentIndex;

  const stepState = (i: number): StepState =>
    i < currentIndex ? 'done' : i === currentIndex ? (stages[i].done ? 'done' : 'current') : 'todo';

  const runEmail = (emailKind: OnboardingEmailKind, cta: string) => {
    send.mutate(
      {
        candidateId: checklist.candidateId,
        candidateName: checklist.candidateName,
        email: candidate?.email ?? '',
        role: candidate?.appliedRole,
        kind: emailKind,
      },
      {
        onSuccess: ({ emailed, emailReason }) => {
          if (emailed) toast.success(`Sent the ${cta} to the candidate.`);
          else if (emailReason === 'not_configured')
            toast.info(`${cta} recorded. Email not sent — SMTP is not configured.`);
          else if (!candidate?.email) toast.info(`${cta} recorded, but no email on file.`);
          else toast.info(`${cta} recorded, but the email could not be sent.`);
        },
        onError: () => toast.error(`Could not send the ${cta} — try again.`),
      },
    );
  };

  const markSigned = () =>
    markOfferSigned.mutate(checklist.candidateId, {
      onSuccess: () => toast.success('Signed offer recorded.'),
      onError: () => toast.error('Could not record the signed offer — try again.'),
    });

  const beginBgv = () => {
    if (!candidate) return;
    startBgv.mutate(candidate, {
      onSuccess: () => toast.success('Background verification started.'),
      onError: () => toast.error('Could not start BGV — try again.'),
    });
  };

  const verifyBgvNow = () => {
    if (!bgv) return;
    const cleared: BGVRequirement = {
      ...bgv,
      overallStatus: 'Verified',
      documents: bgv.documents.map(d => ({ ...d, status: 'Verified' })),
      verificationTimeline: [
        ...bgv.verificationTimeline,
        { date: nowISO(), action: 'Background verification cleared from onboarding', performedBy: 'HR' },
      ],
    };
    updateBgv.mutate(cleared, {
      onSuccess: () => toast.success('Background verification marked as cleared.'),
      onError: () => toast.error('Could not update BGV — try again.'),
    });
  };

  const convertToEmployee = () => {
    promote.mutate(checklist, {
      onSuccess: () => toast.success(`${checklist.candidateName} onboarded into the employee directory.`),
      onError: () => toast.error('Could not convert to employee — try again.'),
    });
  };

  const active = stages[activeStage];
  const ActiveIcon = active.Icon;
  const gateMet = activeStage === 0 || stages[activeStage - 1].done;
  const action = active.action;

  const pending =
    (send.isPending && action.kind === 'email' && send.variables?.kind === action.emailKind) ||
    (markOfferSigned.isPending && action.kind === 'mark-signed') ||
    (startBgv.isPending && action.kind === 'start-bgv') ||
    (updateBgv.isPending && action.kind === 'verify-bgv') ||
    (promote.isPending && action.kind === 'convert-employee');

  // Whether the active stage still has something actionable to show.
  const showAction =
    (action.kind === 'email') ||
    (action.kind === 'mark-signed' && !active.done) ||
    (action.kind === 'start-bgv') ||
    (action.kind === 'verify-bgv' && !active.done) ||
    (action.kind === 'convert-employee' && !active.done);

  const onActionClick = () => {
    switch (action.kind) {
      case 'email':
        return runEmail(action.emailKind, action.cta);
      case 'mark-signed':
        return markSigned();
      case 'start-bgv':
        return beginBgv();
      case 'verify-bgv':
        return verifyBgvNow();
      case 'convert-employee':
        return convertToEmployee();
    }
  };

  const actionLabel =
    action.kind === 'email' ? `${active.done ? 'Resend' : 'Send'} ${action.cta}` : action.kind !== 'none' ? action.cta : '';
  const ActionIcon =
    action.kind === 'email' ? Send : action.kind === 'convert-employee' ? BadgeCheck : action.kind === 'verify-bgv' || action.kind === 'start-bgv' ? Fingerprint : PenLine;

  return (
    <div className="md:col-span-3 rounded-xl border border-[#E4E6EA] bg-[#FFFFFF] p-5">
      <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-wider text-gray-500">
        Onboarding progress <span className="text-gray-400">· click a stage for details</span>
      </p>

      <div className="flex flex-col gap-5 lg:flex-row">
        {/* Stepper */}
        <div className="lg:w-60 lg:shrink-0">
          <Stepper orientation="vertical" value={currentIndex + 1}>
            <StepperNav className="gap-0">
              {stages.map((stage, i) => {
                const state = stepState(i);
                const StageIcon = stage.Icon;
                const last = i === stages.length - 1;
                return (
                  <StepperItem
                    key={stage.label}
                    step={i + 1}
                    completed={state === 'done'}
                    onClick={() => setPicked(i)}
                    className={`-mx-2 !flex-row !items-stretch !justify-start gap-3 rounded-lg px-2 transition-all cursor-pointer ${
                      i === activeStage ? 'bg-[#F1F3F5]' : 'hover:bg-[#F7F8FA]'
                    }`}
                  >
                    <div className="flex flex-col items-center pt-0.5">
                      <StepperIndicator className="size-8 border-2 border-background">
                        {state === 'done' ? <Check size={15} /> : <StageIcon size={14} />}
                      </StepperIndicator>
                      {!last && (
                        <div
                          className={`my-1 w-0.5 flex-1 rounded ${
                            i < currentIndex ? 'bg-emerald-400' : 'bg-[#E4E6EA]'
                          }`}
                        />
                      )}
                    </div>
                    <div className={last ? 'pt-1 pb-1' : 'pt-1 pb-5'}>
                      <StepperTitle className={state === 'todo' ? '!text-gray-400' : '!text-gray-800'}>
                        {stage.label}
                      </StepperTitle>
                      <StepperDescription
                        className={`!text-[11px] ${
                          state === 'done'
                            ? '!text-emerald-600'
                            : state === 'current'
                              ? '!text-accent-600'
                              : '!text-gray-400'
                        }`}
                      >
                        {stage.desc}
                      </StepperDescription>
                    </div>
                  </StepperItem>
                );
              })}
            </StepperNav>
          </Stepper>
        </div>

        {/* Detail panel */}
        <div className="min-h-[200px] flex-1 rounded-xl border border-[#ECEDF0] bg-[#F7F8FA] p-4">
          <div className="mb-3 flex items-center gap-2 border-b border-[#ECEDF0] pb-2.5">
            <span className="grid size-7 place-items-center rounded-lg bg-accent-50 text-accent-600">
              <ActiveIcon size={14} />
            </span>
            <h4 className="text-sm font-bold text-gray-900">{active.label}</h4>
            <span className="ml-auto rounded-full bg-white px-2 py-0.5 font-mono text-[9px] font-bold text-gray-500">
              {active.desc}
            </span>
          </div>

          <p className="text-[12.5px] leading-relaxed text-gray-600">{active.detail}</p>

          {active.at && (
            <p className="mt-2 text-[11px] text-gray-400">
              {active.label === 'Signed offer received' ? 'Recorded' : 'Sent'} on {fmtDateTime(active.at)}
            </p>
          )}

          {showAction && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#ECEDF0] pt-3">
              <button
                onClick={onActionClick}
                disabled={!gateMet || pending}
                title={!gateMet ? 'Complete the previous step first' : undefined}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent-600 px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : !gateMet ? (
                  <Lock size={13} />
                ) : (
                  <ActionIcon size={13} />
                )}
                {actionLabel}
              </button>
              {!gateMet && (
                <span className="text-[11px] text-gray-400">Complete the earlier step to unlock this.</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
