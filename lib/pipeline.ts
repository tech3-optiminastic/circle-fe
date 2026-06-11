/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Single source of truth for "where is this candidate in the pipeline?".
 *
 * The candidate detail page (`/candidates/[id]`) and the dashboard Kanban both
 * derive a candidate's stage from the same cross-entity signals (schedules,
 * interviews, IQ tests, test invites). Keeping that derivation here guarantees
 * the two views never disagree.
 */
import { Candidate, ScheduleEvent, Interview, IQTest, TestInvite } from '@/types';

/** Ordered pipeline stages, mirroring the detail-page stepper. */
export const PIPELINE_STAGES = [
  'Applied',
  'Screening',
  'HR Call',
  'IQ Test',
  'Assignment',
  'Interview',
  'Decision',
] as const;
export type PipelineStageKey = (typeof PIPELINE_STAGES)[number];

/** The Kanban groups by current stage, with `Applied` shown as "New" plus an On-Hold lane. */
export type KanbanColumnKey = 'New' | 'Screening' | 'HR Call' | 'IQ Test' | 'Assignment' | 'Interview' | 'Decision' | 'On Hold';

export interface PipelineContext {
  schedules: ScheduleEvent[];
  interviews: Interview[];
  iqTests: IQTest[];
  invites: TestInvite[];
}

export interface PipelineFlags {
  screeningStarted: boolean;
  screeningDone: boolean;
  hrCallReached: boolean;
  hrCallDone: boolean;
  iqReached: boolean;
  iqDone: boolean;
  asgReached: boolean;
  asgDone: boolean;
  interviewReached: boolean;
  interviewDone: boolean;
  /** Post-interview positive decision: shortlisted for the offer, not yet finalized. */
  offerShortlisted: boolean;
  rejected: boolean;
  selected: boolean;
  decided: boolean;
  onHold: boolean;
}

/**
 * Compute the per-stage reached/done flags for a candidate. This is the exact
 * logic the detail page uses to drive its stepper — extracted so the Kanban
 * can place candidates identically.
 */
export function pipelineFlags(candidate: Candidate, ctx: PipelineContext): PipelineFlags {
  const id = candidate.id;
  const mySchedules = ctx.schedules.filter(s => s.candidateId === id && s.status !== 'Cancelled');
  const myIq = ctx.iqTests.filter(t => t.candidateId === id);
  const myInterviews = ctx.interviews.filter(iv => iv.candidateId === id);
  const myInvites = ctx.invites.filter(i => i.candidateId === id);

  const screeningStarted = Boolean(candidate.fitRating) || Boolean(candidate.screeningReview);
  const screeningDone = Boolean(candidate.fitRating);

  const hrCallDone = Boolean(candidate.hrCall?.completed);
  const hrCallReached =
    hrCallDone || mySchedules.some(s => s.type === 'HR Call') || candidate.status === 'Moved to HR Call';

  const iqInvite = myInvites.find(i => i.kind === 'iq');
  const iqDone = myIq.length > 0 || Boolean(iqInvite && ['Completed', 'Auto-Submitted'].includes(iqInvite.status));
  const iqReached = iqDone || Boolean(iqInvite) || mySchedules.some(s => s.type === 'IQ Test');

  const asgInvite = myInvites.find(i => i.kind === 'assessment');
  const asgDone = Boolean(asgInvite && ['Completed', 'Auto-Submitted'].includes(asgInvite.status));
  const asgReached = Boolean(asgInvite) || mySchedules.some(s => s.type === 'Assessment');

  const interviewDone = myInterviews.some(iv => iv.status === 'Completed');
  const interviewReached = myInterviews.length > 0 || mySchedules.some(s => s.type === 'Interview');

  const offerShortlisted = candidate.status === 'Offer Shortlisted';
  const rejected = candidate.status === 'Rejected';
  const selected = candidate.status === 'Selected';
  const decided = rejected || selected;
  const onHold = candidate.status === 'On Hold';

  return {
    screeningStarted,
    screeningDone,
    hrCallReached,
    hrCallDone,
    iqReached,
    iqDone,
    asgReached,
    asgDone,
    interviewReached,
    interviewDone,
    offerShortlisted,
    rejected,
    selected,
    decided,
    onHold,
  };
}

/**
 * Which Kanban column a candidate belongs in — the furthest stage they've
 * reached. On Hold and decided (Selected/Rejected) take precedence so those
 * candidates don't linger in an intermediate lane.
 */
export function pipelineColumn(candidate: Candidate, ctx: PipelineContext): KanbanColumnKey {
  const f = pipelineFlags(candidate, ctx);
  if (f.onHold) return 'On Hold';
  if (f.decided || f.offerShortlisted) return 'Decision';
  if (f.interviewReached) return 'Interview';
  if (f.asgReached) return 'Assignment';
  if (f.iqReached) return 'IQ Test';
  if (f.hrCallReached) return 'HR Call';
  if (f.screeningStarted) return 'Screening';
  return 'New';
}

/** Short human-readable status for a candidate's current position, used on cards. */
export function pipelineSummary(candidate: Candidate, ctx: PipelineContext): string {
  const f = pipelineFlags(candidate, ctx);
  if (f.onHold) return 'On hold';
  if (f.selected) return 'Selected';
  if (f.rejected) return 'Rejected';
  if (f.offerShortlisted) return 'Shortlisted for offer';
  if (f.interviewReached) return f.interviewDone ? 'Interview done' : 'Interview scheduled';
  if (f.asgReached) return f.asgDone ? 'Assignment submitted' : 'Assignment sent';
  if (f.iqReached) return f.iqDone ? 'IQ test done' : 'IQ test scheduled';
  if (f.hrCallReached) return f.hrCallDone ? 'HR call done' : 'HR call scheduled';
  if (f.screeningStarted) return f.screeningDone ? 'Screened' : 'In screening';
  return 'New application';
}
