import { Candidate, Interview, SentEmailLog } from '@/types';
import { nowISO, randomId, todayISO } from '@/lib/utils';

export interface ScheduleInput {
  round: string;
  interviewer: string;
  dateTime: string;
  mode: string;
}

export function buildScheduledInterview(candidate: Candidate, input: ScheduleInput): Interview {
  return {
    id: randomId('INT'),
    candidateId: candidate.id,
    candidateName: candidate.fullName,
    appliedRole: candidate.appliedRole,
    department: candidate.department,
    interviewRound: input.round,
    interviewerName: input.interviewer,
    dateTime: input.dateTime,
    meetingMode: input.mode as Interview['meetingMode'],
    meetingLink:
      input.mode === 'In-Person' ? 'Building A conference wing' : 'https://meet.google.com/qwe-asdf-zxc',
    durationMinutes: 45,
    status: 'Scheduled',
  };
}

export function buildInterviewInviteEmail(candidate: Candidate, round: string): SentEmailLog {
  return {
    id: randomId('LOG', 9000, 1000),
    recipientName: candidate.fullName,
    recipientEmail: candidate.email,
    templateTitle: 'Interview scheduled email',
    subject: `Scheduled: ${round} Interview - ${candidate.fullName}`,
    dateSent: nowISO(),
    status: 'Delivered',
    relatedEntity: candidate.fullName,
  };
}

export function applyGrading(interview: Interview, recommendation: string, comments: string): Interview {
  return {
    ...interview,
    status: 'Completed',
    grading: {
      grades: {
        subjectKnowledge: 4,
        clarityOfCommunication: 5,
        confidence: 5,
        practicalExperience: 4,
        problemSolvingAbility: 4,
        attitude: 4,
        teamFit: 4,
        learningAbility: 4,
        overallSuitability: 5,
      },
      interviewerComments: comments,
      recommendation: recommendation as any,
      gradedAt: todayISO(),
    },
  };
}
