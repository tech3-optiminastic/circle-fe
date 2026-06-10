'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Download, FileCheck2, Star, UserCheck } from 'lucide-react';
import { TestInvite } from '@/types';
import { repositories } from '@/lib/api/repositories';
import { openDocument } from '@/features/documents/hooks';
import { sendTestEmail } from '@/lib/api/notifications';
import { useToast } from '@/components/Toaster';
import { useScheduler } from '@/store/schedule-store';
import { ASSIGNMENT_MAX_MARKS, ASSIGNMENT_PASS_MARKS } from '@/data/test-banks';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const ASSIGNMENTS_KEY = ['test-invites', 'assignments'] as const;

function fmtDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString();
}

function StatusBadge({ invite }: { invite: TestInvite }) {
  const map: Record<string, string> = {
    Submitted: 'bg-amber-50 text-amber-600',
    Graded: invite.passed ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600',
    Pending: 'bg-accent-50 text-accent-600',
  };
  const label =
    invite.status === 'Graded' ? (invite.passed ? 'Passed' : 'Not selected') : invite.status;
  return (
    <span className={`rounded-full px-2 py-0.5 text-[9px] font-mono font-bold ${map[invite.status] ?? 'bg-gray-100 text-gray-600'}`}>
      {label}
    </span>
  );
}

export function AssignmentSubmissionsView() {
  const toast = useToast();
  const qc = useQueryClient();
  const { openSchedule } = useScheduler();

  const { data: invites = [], isLoading } = useQuery({
    queryKey: ASSIGNMENTS_KEY,
    queryFn: async () => (await repositories.testInvites.list()).filter(t => t.kind === 'assignment'),
  });

  const [grading, setGrading] = useState<TestInvite | null>(null);
  const [score, setScore] = useState('');
  const [comments, setComments] = useState('');

  const openGrade = (invite: TestInvite) => {
    setGrading(invite);
    setScore(invite.score != null ? String(invite.score) : '');
    setComments(invite.gradeComments ?? '');
  };

  const grade = useMutation({
    mutationFn: async ({ invite, value, notes }: { invite: TestInvite; value: number; notes: string }) => {
      const passed = value >= ASSIGNMENT_PASS_MARKS;
      await repositories.testInvites.patch(invite.id, {
        status: 'Graded',
        score: value,
        passed,
        gradeComments: notes,
      });
      if (!passed) {
        await repositories.candidates.patch(invite.candidateId, { status: 'Rejected' }).catch(() => {});
        sendTestEmail({
          to: invite.email,
          candidateName: invite.candidateName,
          template: 'assessment_failed',
          position: invite.position,
        }).catch(() => {});
      }
      return { invite, passed };
    },
    onSuccess: ({ invite, passed }) => {
      qc.invalidateQueries({ queryKey: ASSIGNMENTS_KEY });
      setGrading(null);
      setScore('');
      setComments('');
      if (passed) {
        toast.success(`${invite.candidateName} cleared the assignment — schedule the interview.`);
        openSchedule(invite.candidateId, invite.candidateName, 'Interview');
      } else {
        toast.info(`${invite.candidateName} was not moved forward.`);
      }
    },
    onError: () => toast.error('Could not save the grade — try again.'),
  });

  const submitGrade = () => {
    if (!grading) return;
    const value = Number(score);
    if (Number.isNaN(value) || value < 0 || value > ASSIGNMENT_MAX_MARKS) {
      toast.error(`Enter a score between 0 and ${ASSIGNMENT_MAX_MARKS}.`);
      return;
    }
    grade.mutate({ invite: grading, value, notes: comments });
  };

  return (
    <div className="space-y-4 text-xs select-none">
      <div>
        <h2 className="font-display text-sm font-bold tracking-tight text-gray-900">
          Take-home Assignments
        </h2>
        <p className="text-[11px] text-gray-500">
          Candidates who cleared the IQ round get a take-home assignment. Review submissions and
          grade them — a pass moves them to the interview.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#DAD4C8] bg-[#F7F4EE] shadow-2xs">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[#DAD4C8] bg-[#F2EEE7] font-mono text-[9px] font-bold uppercase text-gray-500">
              <th className="p-3">Candidate</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Submission</th>
              <th className="p-3 text-center">Score</th>
              <th className="p-3">Deadline</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DAD4C8]">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : invites.length === 0 ? (
              <tr>
                <td colSpan={7} className="bg-[#F7F4EE] p-3">
                  <EmptyState
                    icon={ClipboardList}
                    title="No assignments yet"
                    description="Assignments appear here once candidates clear the IQ round."
                    className="border-0 bg-transparent py-10"
                  />
                </td>
              </tr>
            ) : (
              invites.map(inv => (
                <tr key={inv.id} className="transition hover:bg-[#F2EEE7]">
                  <td className="p-3 font-semibold text-gray-900">{inv.candidateName}</td>
                  <td className="p-3 text-gray-600">{inv.position}</td>
                  <td className="p-3">
                    <StatusBadge invite={inv} />
                  </td>
                  <td className="p-3">
                    {inv.submissionDocId ? (
                      <button
                        onClick={() => openDocument(inv.submissionDocId!)}
                        className="inline-flex items-center gap-1 text-accent-600 hover:underline cursor-pointer"
                      >
                        <Download size={12} /> {inv.submissionFileName ?? 'Download'}
                      </button>
                    ) : (
                      <span className="text-gray-400">Awaiting submission</span>
                    )}
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-gray-700">
                    {inv.status === 'Graded' ? `${inv.score}/${ASSIGNMENT_MAX_MARKS}` : '—'}
                  </td>
                  <td className="p-3 font-mono text-[10px] text-gray-500">{fmtDate(inv.deadlineIso)}</td>
                  <td className="p-3 text-right">
                    {inv.status === 'Submitted' ? (
                      <Button size="sm" onClick={() => openGrade(inv)}>
                        <Star size={13} /> Grade
                      </Button>
                    ) : inv.status === 'Graded' ? (
                      <Button size="sm" variant="outline" onClick={() => openGrade(inv)}>
                        <FileCheck2 size={13} /> Review
                      </Button>
                    ) : (
                      <span className="text-[10px] text-gray-400">Not submitted</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Grade dialog */}
      <Dialog open={Boolean(grading)} onOpenChange={open => !open && setGrading(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck size={16} className="text-accent-600" />
              Grade — {grading?.candidateName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {grading?.submissionDocId && (
              <button
                onClick={() => openDocument(grading.submissionDocId!)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-secondary cursor-pointer"
              >
                <Download size={14} /> {grading.submissionFileName ?? 'Download submission'}
              </button>
            )}
            <div>
              <Label htmlFor="grade-score" className="text-sm font-medium">
                Score (out of {ASSIGNMENT_MAX_MARKS}) — pass ≥ {ASSIGNMENT_PASS_MARKS}
              </Label>
              <Input
                id="grade-score"
                type="number"
                min={0}
                max={ASSIGNMENT_MAX_MARKS}
                value={score}
                onChange={e => setScore(e.target.value)}
                placeholder="e.g. 72"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="grade-comments" className="text-sm font-medium">
                Evaluator comments
              </Label>
              <Textarea
                id="grade-comments"
                value={comments}
                onChange={e => setComments(e.target.value)}
                placeholder="Strengths, gaps, overall assessment…"
                rows={4}
                className="mt-2"
              />
            </div>
            <p className="text-[11px] text-gray-500">
              A pass schedules the interview and notifies the candidate. A fail marks them not
              selected and sends the outcome email.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setGrading(null)}>
              Cancel
            </Button>
            <Button onClick={submitGrade} disabled={grade.isPending}>
              Save grade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AssignmentSubmissionsView;
