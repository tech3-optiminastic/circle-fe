/**
 * Notification endpoints — candidate-facing emails triggered by HR actions.
 * Delivery is best-effort on the backend; the response says whether the email
 * was queued ({sent:true}) or why it was skipped.
 */

import { http } from '@/lib/http/client';
import { ScheduleType } from '@/types';

export interface ScheduleEmailResult {
  sent: boolean;
  reason?: 'not_configured' | 'no_recipient';
}

export function sendScheduleEmail(input: {
  to: string;
  candidateName: string;
  type: ScheduleType;
  dateTimeIso: string;
  notes?: string;
}): Promise<ScheduleEmailResult> {
  return http.post<ScheduleEmailResult>('/notifications/schedule-email', input);
}

export type TestEmailTemplate =
  | 'iq_invite'
  | 'iq_passed'
  | 'iq_failed'
  | 'assignment_invite'
  | 'assessment_invite'
  | 'assessment_passed'
  | 'assessment_failed';

/** Send one of the online-test pipeline emails (invite links, pass/fail results). */
export function sendTestEmail(input: {
  to: string;
  candidateName: string;
  template: TestEmailTemplate;
  testUrl?: string;
  position?: string;
  score?: string;
  durationMin?: number;
  dateTimeIso?: string;
}): Promise<ScheduleEmailResult> {
  return http.post<ScheduleEmailResult>('/notifications/test-email', input);
}
