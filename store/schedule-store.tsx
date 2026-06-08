'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';
import { Candidate, ScheduleEvent, ScheduleType, TestInvite } from '@/types';
import { useSchedules, useScheduleMutations } from '@/features/schedule/hooks';
import { useInterviews } from '@/features/interviews/hooks';
import { useCandidates, useCandidateMutations } from '@/features/candidates/hooks';
import { ScheduleModal, BusySlot } from '@/components/ScheduleModal';
import { useToast } from '@/components/Toaster';
import { sendScheduleEmail, sendTestEmail } from '@/lib/api/notifications';
import { pushCalendarEvent } from '@/lib/api/calendar';
import { repositories } from '@/lib/api/repositories';
import { IQ_DURATION_MIN, ASSESSMENT_DURATION_MIN } from '@/data/test-banks';
import { randomId, randomToken, nowISO } from '@/lib/utils';

interface Pending {
  candidateId: string;
  candidateName: string;
  defaultType: ScheduleType;
}

interface SchedulerApi {
  /** Open the scheduling dialog; on confirm the candidate is shortlisted + an event is created. */
  openSchedule: (candidateId: string, candidateName: string, defaultType?: ScheduleType) => void;
}

const SchedulerContext = createContext<SchedulerApi | null>(null);

const SLOT_MIN = 45;

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const toast = useToast();
  const [pending, setPending] = useState<Pending | null>(null);
  const { data: schedules = [] } = useSchedules();
  const { data: interviews = [] } = useInterviews();
  const { data: candidates = [] } = useCandidates();
  const { create } = useScheduleMutations();
  const { move } = useCandidateMutations();

  // Existing booked slots (planned schedules + interviews) so the dialog can
  // prevent overlapping bookings.
  const busySlots: BusySlot[] = useMemo(() => {
    const slots: BusySlot[] = [];
    for (const s of schedules) {
      if (s.status === 'Cancelled') continue;
      const start = new Date(s.dateTime).getTime();
      if (Number.isNaN(start)) continue;
      slots.push({ start, end: start + SLOT_MIN * 60_000, label: `${s.type} · ${s.candidateName}` });
    }
    for (const iv of interviews) {
      const start = new Date(iv.dateTime).getTime();
      if (Number.isNaN(start)) continue;
      slots.push({
        start,
        end: start + (iv.durationMinutes || SLOT_MIN) * 60_000,
        label: `${iv.interviewRound} · ${iv.candidateName}`,
      });
    }
    return slots;
  }, [schedules, interviews]);

  const openSchedule = (
    candidateId: string,
    candidateName: string,
    defaultType: ScheduleType = 'HR Call',
  ) => setPending({ candidateId, candidateName, defaultType });

  const confirm = async ({
    type,
    dateTime,
    durationMin,
    notes,
  }: {
    type: ScheduleType;
    dateTime: string;
    durationMin: number;
    notes: string;
  }) => {
    if (!pending) return;
    const p = pending; // capture — setPending(null) runs before async work below
    const event: ScheduleEvent = {
      id: randomId('SCH'),
      candidateId: p.candidateId,
      candidateName: p.candidateName,
      type,
      title: `${type} · ${p.candidateName}`,
      dateTime,
      notes,
      status: 'Scheduled',
      createdAt: nowISO(),
    };
    create.mutate(event);
    move.mutate({ id: p.candidateId, status: 'Shortlisted' });
    setPending(null);

    // Best-effort candidate notification — never blocks/undoes the schedule.
    let candidate: Candidate | undefined = candidates.find(c => c.id === p.candidateId);
    if (!candidate?.email) {
      try {
        candidate = await repositories.candidates.get(p.candidateId);
      } catch {
        /* fall through to the no-email path */
      }
    }
    const email = candidate?.email ?? '';

    // Best-effort push to the shared Google Calendar — never blocks/undoes the
    // schedule (mirrors the email sends). No-ops if Google isn't configured.
    pushCalendarEvent({
      appEventId: event.id,
      type,
      title: event.title,
      dateTimeIso: dateTime,
      durationMin,
      notes: notes || undefined,
      attendeeEmail: email || undefined,
    }).catch(() => {
      /* calendar sync is non-critical */
    });

    if (!email) {
      toast.info('Scheduled, but no email on file — candidate not notified.');
      return;
    }

    const emailToast = (res: { sent: boolean; reason?: string }, successMsg: string) => {
      if (res.sent) toast.success(successMsg);
      else if (res.reason === 'not_configured')
        toast.info('Scheduled. Email not sent — SMTP is not configured yet.');
      else toast.info('Scheduled, but the candidate was not emailed.');
    };

    // IQ Test / Assessment are online tests — create a secure invite and email
    // its link. HR Call / Interview keep the plain schedule notification.
    if (type === 'IQ Test' || type === 'Assessment') {
      const isIq = type === 'IQ Test';
      const invite: TestInvite = {
        id: randomToken('TIV'),
        kind: isIq ? 'iq' : 'assessment',
        candidateId: p.candidateId,
        candidateName: p.candidateName,
        email,
        position: candidate?.appliedRole || candidate?.department || 'the role',
        department: candidate?.department || 'General',
        jobId: candidate?.jobId,
        durationMin: isIq ? IQ_DURATION_MIN : ASSESSMENT_DURATION_MIN,
        scheduledFor: dateTime,
        status: 'Pending',
        createdAt: nowISO(),
      };
      try {
        await repositories.testInvites.create(invite);
      } catch {
        toast.error('Scheduled, but creating the test link failed — try rescheduling.');
        return;
      }
      sendTestEmail({
        to: email,
        candidateName: p.candidateName,
        template: isIq ? 'iq_invite' : 'assessment_invite',
        testUrl: `${window.location.origin}/test/${invite.id}`,
        position: invite.position,
        durationMin: invite.durationMin,
        dateTimeIso: dateTime,
      })
        .then(res => emailToast(res, `Test link emailed to ${p.candidateName}.`))
        .catch(() => toast.error('Scheduled, but sending the test link failed.'));
      return;
    }

    sendScheduleEmail({
      to: email,
      candidateName: p.candidateName,
      type,
      dateTimeIso: dateTime,
      notes: notes || undefined,
    })
      .then(res => emailToast(res, `Invitation emailed to ${p.candidateName}.`))
      .catch(() => toast.error('Scheduled, but sending the email failed.'));
  };

  return (
    <SchedulerContext.Provider value={{ openSchedule }}>
      {children}
      {pending && (
        <ScheduleModal
          candidateName={pending.candidateName}
          defaultType={pending.defaultType}
          busySlots={busySlots}
          onConfirm={confirm}
          onClose={() => setPending(null)}
        />
      )}
    </SchedulerContext.Provider>
  );
}

export function useScheduler(): SchedulerApi {
  const ctx = useContext(SchedulerContext);
  if (!ctx) throw new Error('useScheduler must be used within a ScheduleProvider');
  return ctx;
}
