'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Logo } from '@/components/Logo';
import { TestInvite, IQTest } from '@/types';
import { repositories } from '@/lib/api/repositories';
import { qk } from '@/lib/query/keys';
import { sendTestEmail } from '@/lib/api/notifications';
import { nowISO, randomId, randomToken } from '@/lib/utils';
import {
  TestQuestion,
  IQ_QUESTIONS,
  assessmentBankFor,
  iqScoreFromCorrect,
  IQ_PASS_SCORE,
  ASSESSMENT_PASS_PERCENT,
  ASSESSMENT_DURATION_MIN,
} from '@/data/test-banks';
import {
  BrainCircuit,
  ClipboardList,
  Clock4,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Maximize2,
  EyeOff,
  Timer,
  ListChecks,
} from 'lucide-react';

const MAX_VIOLATIONS = 3;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const answersKey = (id: string) => `curcle.test.answers.${id}`;

function loadAnswers(id: string): Record<string, number> {
  try {
    const raw = localStorage.getItem(answersKey(id));
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function fmtClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

async function enterFullscreen(): Promise<void> {
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
  } catch {
    /* browser may refuse — visibility tracking still applies */
  }
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PublicTestPage() {
  const params = useParams<{ inviteId: string }>();
  const inviteId = params?.inviteId ?? '';

  const {
    data: invite,
    isLoading,
    isError,
  } = useQuery({
    queryKey: qk.testInvites.detail(inviteId),
    queryFn: () => repositories.testInvites.get(inviteId),
    enabled: Boolean(inviteId),
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-3 py-20 text-gray-500">
          <Loader2 size={26} className="animate-spin text-accent-600" />
          <p className="text-sm">Loading your test…</p>
        </div>
      </Shell>
    );
  }

  if (isError || !invite) {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-3 py-16 text-center px-6">
          <span className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
            <XCircle size={26} />
          </span>
          <h1 className="text-lg font-bold text-gray-900">Test link not found</h1>
          <p className="text-sm text-gray-500 max-w-sm">
            This test link is invalid or has been removed. Please contact the HR team if you
            believe this is a mistake.
          </p>
        </div>
      </Shell>
    );
  }

  return <TestFlow invite={invite} />;
}

/* ------------------------------------------------------------------ */
/*  Test flow (intro → running → result)                               */
/* ------------------------------------------------------------------ */

function TestFlow({ invite }: { invite: TestInvite }) {
  const isIq = invite.kind === 'iq';
  const questions: TestQuestion[] = useMemo(
    () => (isIq ? IQ_QUESTIONS : assessmentBankFor(invite.department)),
    [isIq, invite.department],
  );

  // The invite is the source of truth for completion + start time, so a
  // refresh (or reopening the link) can never reset the timer or allow a redo.
  const [phase, setPhase] = useState<'intro' | 'running' | 'submitting' | 'done'>(
    invite.status === 'Completed' || invite.status === 'Auto-Submitted' ? 'done' : 'intro',
  );
  const [startedAt, setStartedAt] = useState<string | null>(invite.startedAt ?? null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [violations, setViolations] = useState<number>(invite.violations ?? 0);
  const [remainingMs, setRemainingMs] = useState<number>(invite.durationMin * 60_000);
  const [warning, setWarning] = useState<string | null>(null);
  const [result, setResult] = useState<{ score: number; passed: boolean; autoSubmitted: boolean } | null>(
    invite.status === 'Completed' || invite.status === 'Auto-Submitted'
      ? {
          score: invite.score ?? 0,
          passed: invite.passed ?? false,
          autoSubmitted: invite.status === 'Auto-Submitted',
        }
      : null,
  );

  const submittingRef = useRef(false);
  const violationsRef = useRef(violations);
  const answersRef = useRef(answers);
  const lastViolationAt = useRef(0);
  violationsRef.current = violations;
  answersRef.current = answers;

  /* ---------- resume an in-progress attempt after refresh ---------- */
  useEffect(() => {
    if (invite.status === 'In Progress' && invite.startedAt) {
      setAnswers(loadAnswers(invite.id));
      setStartedAt(invite.startedAt);
      setPhase('running');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ----------------------------- start ----------------------------- */
  const start = async () => {
    const started = nowISO();
    setStartedAt(started);
    setPhase('running');
    await enterFullscreen();
    repositories.testInvites
      .patch(invite.id, { status: 'In Progress', startedAt: started })
      .catch(() => {/* tolerated — submit still records everything */});
  };

  /* ----------------------------- submit ---------------------------- */
  const submit = useCallback(
    async (auto: boolean) => {
      if (submittingRef.current) return;
      submittingRef.current = true;
      setPhase('submitting');

      const finalAnswers = answersRef.current;
      const total = questions.length;
      const correct = questions.reduce(
        (acc, q) => acc + (finalAnswers[q.id] === q.answer ? 1 : 0),
        0,
      );
      const score = isIq ? iqScoreFromCorrect(correct, total) : Math.round((correct / total) * 100);
      const passed = isIq ? score >= IQ_PASS_SCORE : score >= ASSESSMENT_PASS_PERCENT;
      const completedAt = nowISO();
      const timeTakenMin = startedAt
        ? Math.max(1, Math.round((Date.now() - new Date(startedAt).getTime()) / 60_000))
        : invite.durationMin;

      try {
        await repositories.testInvites.patch(invite.id, {
          status: auto ? 'Auto-Submitted' : 'Completed',
          completedAt,
          correct,
          total,
          score,
          passed,
          violations: violationsRef.current,
          answers: finalAnswers, // per-question record for HR analysis
        });
      } catch {
        /* even if this PATCH fails we still show the result; HR records below */
      }

      // ---- side effects: HR records, candidate status, next-step emails ----
      try {
        if (isIq) {
          const iqRecord: IQTest = {
            id: randomId('IQT', 9000, 1000),
            candidateId: invite.candidateId,
            candidateName: invite.candidateName,
            appliedRole: invite.position,
            testDate: completedAt.split('T')[0],
            totalQuestions: total,
            questionsAttempted: Object.keys(finalAnswers).length,
            correctAnswers: correct,
            incorrectAnswers: total - correct,
            scorePercentage: Math.round((correct / total) * 100),
            timeTakenMinutes: timeTakenMin,
            qualificationStatus: passed ? 'Passed' : 'Failed',
            remarks: `IQ score ${score} · ${violationsRef.current} violation(s)${auto ? ' · auto-submitted' : ''}`,
          };
          await repositories.iqTests.create(iqRecord).catch(() => {});

          if (passed) {
            // Auto-chain: create the role assessment invite and email its link.
            const assessment: TestInvite = {
              id: randomToken('TIV'),
              kind: 'assessment',
              candidateId: invite.candidateId,
              candidateName: invite.candidateName,
              email: invite.email,
              position: invite.position,
              department: invite.department,
              jobId: invite.jobId,
              durationMin: ASSESSMENT_DURATION_MIN,
              status: 'Pending',
              createdAt: nowISO(),
            };
            await repositories.testInvites.create(assessment).catch(() => {});
            sendTestEmail({
              to: invite.email,
              candidateName: invite.candidateName,
              template: 'iq_passed',
              testUrl: `${window.location.origin}/test/${assessment.id}`,
              position: invite.position,
              score: String(score),
              durationMin: ASSESSMENT_DURATION_MIN,
            }).catch(() => {});
          } else {
            repositories.candidates
              .patch(invite.candidateId, { status: 'Rejected' })
              .catch(() => {});
            sendTestEmail({
              to: invite.email,
              candidateName: invite.candidateName,
              template: 'iq_failed',
              position: invite.position,
              score: String(score),
            }).catch(() => {});
          }
        } else {
          // Assessment round
          if (passed) {
            sendTestEmail({
              to: invite.email,
              candidateName: invite.candidateName,
              template: 'assessment_passed',
              position: invite.position,
              score: `${score}%`,
            }).catch(() => {});
          } else {
            repositories.candidates
              .patch(invite.candidateId, { status: 'Rejected' })
              .catch(() => {});
            sendTestEmail({
              to: invite.email,
              candidateName: invite.candidateName,
              template: 'assessment_failed',
              position: invite.position,
              score: `${score}%`,
            }).catch(() => {});
          }
        }
      } finally {
        try {
          localStorage.removeItem(answersKey(invite.id));
        } catch {
          /* ignore */
        }
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        setResult({ score, passed, autoSubmitted: auto });
        setPhase('done');
      }
    },
    [invite, isIq, questions, startedAt],
  );

  /* ----------------------------- timer ----------------------------- */
  useEffect(() => {
    if (phase !== 'running' || !startedAt) return;
    const deadline = new Date(startedAt).getTime() + invite.durationMin * 60_000;
    const tick = () => {
      const left = deadline - Date.now();
      setRemainingMs(left);
      if (left <= 0) submit(true);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [phase, startedAt, invite.durationMin, submit]);

  /* ------------------------- anti-cheat ---------------------------- */
  const flagViolation = useCallback(
    (label: string) => {
      // blur + visibilitychange often fire together for one tab switch —
      // collapse anything within 1.5s into a single violation.
      const now = Date.now();
      if (now - lastViolationAt.current < 1500) return;
      lastViolationAt.current = now;

      const next = violationsRef.current + 1;
      setViolations(next);
      repositories.testInvites.patch(invite.id, { violations: next }).catch(() => {});
      if (next >= MAX_VIOLATIONS) {
        setWarning(null);
        submit(true);
      } else {
        setWarning(
          `${label} detected — warning ${next} of ${MAX_VIOLATIONS - 1}. One more and your test is auto-submitted.`,
        );
      }
    },
    [invite.id, submit],
  );

  useEffect(() => {
    if (phase !== 'running') return;

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flagViolation('Tab switch');
    };
    const onBlur = () => flagViolation('Leaving the test window');
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) flagViolation('Exiting full screen');
    };
    const block = (e: Event) => e.preventDefault();

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('contextmenu', block);
    document.addEventListener('copy', block);
    document.addEventListener('paste', block);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('copy', block);
      document.removeEventListener('paste', block);
    };
  }, [phase, flagViolation]);

  /* ------------------------ answer handling ------------------------ */
  const pick = (qid: string, idx: number) => {
    setAnswers(prev => {
      const next = { ...prev, [qid]: idx };
      try {
        localStorage.setItem(answersKey(invite.id), JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const answered = Object.keys(answers).length;
  const lowTime = remainingMs <= 2 * 60_000;

  /* ------------------------------ UI ------------------------------- */

  if (phase === 'done' && result) {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-4 py-14 text-center px-6">
          <span
            className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              result.passed ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
            }`}
          >
            {result.passed ? <CheckCircle2 size={30} /> : <XCircle size={30} />}
          </span>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {result.passed ? 'Congratulations — you passed!' : 'Test submitted'}
            </h1>
            <p className="text-sm text-gray-500 mt-1 max-w-md">
              {result.autoSubmitted &&
                'Your test was submitted automatically (time limit or rule violations). '}
              Your responses have been recorded.
            </p>
          </div>
          <div className="bg-white border border-[#EAEAEC] rounded-2xl px-8 py-5 shadow-2xs">
            <p className="text-[11px] font-mono uppercase tracking-wider text-gray-400">
              Your score
            </p>
            <p
              className={`text-4xl font-bold tabular-nums mt-1 ${
                result.passed ? 'text-emerald-600' : 'text-red-500'
              }`}
            >
              {result.score}
              {invite.kind === 'assessment' && <span className="text-xl">%</span>}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              {invite.kind === 'iq'
                ? `Qualifying score: ${IQ_PASS_SCORE}+`
                : `Qualifying score: ${ASSESSMENT_PASS_PERCENT}%+`}
            </p>
          </div>
          <p className="text-sm text-gray-600 max-w-md">
            {result.passed
              ? invite.kind === 'iq'
                ? '📧 Check your email — your role assessment link is on its way.'
                : '📧 Check your email — details about your in-person interview are on the way.'
              : 'Our HR team has been notified and you will receive an email about the outcome.'}
          </p>
        </div>
      </Shell>
    );
  }

  if (phase === 'submitting') {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-3 py-20 text-gray-500">
          <Loader2 size={26} className="animate-spin text-accent-600" />
          <p className="text-sm">Submitting your answers…</p>
        </div>
      </Shell>
    );
  }

  if (phase === 'intro') {
    return (
      <Shell>
        <div className="px-6 py-10 max-w-xl mx-auto space-y-6">
          <div className="flex items-start gap-3.5">
            <span className="w-12 h-12 rounded-2xl bg-accent-50 text-accent-600 flex items-center justify-center shrink-0">
              {isIq ? <BrainCircuit size={22} /> : <ClipboardList size={22} />}
            </span>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {isIq ? 'IQ Test' : `${invite.position} Assessment`}
              </h1>
              <p className="text-sm text-gray-500">
                Hi <span className="font-semibold text-gray-700">{invite.candidateName}</span> —
                you&apos;re about to start your{' '}
                {isIq ? 'logical reasoning test' : 'role-specific assessment'}.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white border border-[#EAEAEC] rounded-xl py-3.5">
              <ListChecks size={16} className="mx-auto text-accent-600" />
              <p className="text-lg font-bold text-gray-900 mt-1">{questions.length}</p>
              <p className="text-[10px] text-gray-400 font-mono uppercase">Questions</p>
            </div>
            <div className="bg-white border border-[#EAEAEC] rounded-xl py-3.5">
              <Timer size={16} className="mx-auto text-accent-600" />
              <p className="text-lg font-bold text-gray-900 mt-1">{invite.durationMin} min</p>
              <p className="text-[10px] text-gray-400 font-mono uppercase">Time limit</p>
            </div>
            <div className="bg-white border border-[#EAEAEC] rounded-xl py-3.5">
              <CheckCircle2 size={16} className="mx-auto text-accent-600" />
              <p className="text-lg font-bold text-gray-900 mt-1">
                {isIq ? IQ_PASS_SCORE : `${ASSESSMENT_PASS_PERCENT}%`}
              </p>
              <p className="text-[10px] text-gray-400 font-mono uppercase">To qualify</p>
            </div>
          </div>

          <div className="bg-[#FAFBFC] border border-[#EAEAEC] rounded-2xl p-5 space-y-3">
            <p className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <ShieldAlert size={16} className="text-accent-600" /> Test rules — read carefully
            </p>
            <ul className="space-y-2 text-[13px] text-gray-600">
              <li className="flex items-start gap-2">
                <Maximize2 size={14} className="mt-0.5 shrink-0 text-gray-400" />
                The test runs in <strong>full screen</strong>. Exiting full screen is flagged.
              </li>
              <li className="flex items-start gap-2">
                <EyeOff size={14} className="mt-0.5 shrink-0 text-gray-400" />
                <span>
                  <strong>Do not switch tabs or leave this window.</strong> Each switch is a
                  violation — after {MAX_VIOLATIONS} your test auto-submits with whatever you have
                  answered.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Clock4 size={14} className="mt-0.5 shrink-0 text-gray-400" />
                The timer keeps running even if you refresh — your answers are preserved, the
                clock is not paused.
              </li>
            </ul>
          </div>

          <button
            onClick={start}
            className="w-full bg-accent-600 hover:bg-accent-700 text-white py-3 rounded-xl font-bold text-sm cursor-pointer transition shadow-sm"
          >
            I understand — Start the test
          </button>
        </div>
      </Shell>
    );
  }

  /* --------------------------- running ----------------------------- */
  return (
    <div className="min-h-screen bg-[#F6F6F7] select-none">
      {/* Sticky proctor bar */}
      <div className="sticky top-0 z-50 bg-[#0891B2] text-white px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Logo size={22} />
          <span className="text-xs font-bold truncate">
            {isIq ? 'IQ Test' : `${invite.position} Assessment`}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] font-mono text-white/70 hidden sm:inline">
            {answered}/{questions.length} answered
          </span>
          {violations > 0 && (
            <span className="text-[10px] font-mono bg-red-500/20 text-red-200 px-2 py-0.5 rounded-full">
              ⚠ {violations}/{MAX_VIOLATIONS}
            </span>
          )}
          <span
            className={`font-mono font-bold text-sm tabular-nums px-2.5 py-1 rounded-lg ${
              lowTime ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10'
            }`}
          >
            {fmtClock(remainingMs)}
          </span>
        </div>
      </div>

      {/* Violation warning */}
      {warning && (
        <div className="sticky top-[44px] z-40 bg-red-50 border-b border-red-200 text-red-700 text-xs px-4 py-2.5 flex items-center gap-2">
          <AlertTriangle size={14} className="shrink-0" />
          <span className="font-semibold">{warning}</span>
          <button
            onClick={() => setWarning(null)}
            className="ml-auto text-red-400 hover:text-red-600 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 pb-28">
        {questions.map((q, i) => (
          <div
            key={q.id}
            className="bg-white border border-[#EAEAEC] rounded-2xl p-4 sm:p-5 shadow-2xs"
          >
            <p className="text-[13px] font-semibold text-gray-900 leading-relaxed">
              <span className="text-accent-600 font-mono font-bold mr-1.5">{i + 1}.</span>
              {q.q}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
              {q.options.map((opt, idx) => {
                const selected = answers[q.id] === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => pick(q.id, idx)}
                    className={`text-left text-[12.5px] px-3 py-2.5 rounded-lg border transition cursor-pointer ${
                      selected
                        ? 'border-accent-500 bg-accent-50 text-accent-800 font-semibold'
                        : 'border-[#EAEAEC] text-gray-600 hover:bg-[#FAFBFC]'
                    }`}
                  >
                    <span className="font-mono font-bold mr-1.5 text-gray-400">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Submit bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-[#EAEAEC] px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <p className="text-[11px] text-gray-500 font-mono">
            {answered}/{questions.length} answered
            {answered < questions.length && ' — unanswered count as incorrect'}
          </p>
          <button
            onClick={() => submit(false)}
            className="bg-accent-600 hover:bg-accent-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition shadow-sm"
          >
            Submit test
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Layout shell for non-running states                                */
/* ------------------------------------------------------------------ */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F6F6F7] flex flex-col">
      <header className="bg-[#0891B2] px-5 py-3.5 flex items-center gap-2.5">
        <Logo size={26} />
        <div>
          <p className="text-white text-sm font-bold leading-tight">Curcle</p>
          <p className="text-white/50 text-[9px] font-mono uppercase tracking-wider">
            Recruitment Test Portal
          </p>
        </div>
      </header>
      <main className="flex-1 flex flex-col justify-center max-w-2xl w-full mx-auto">
        {children}
      </main>
      <footer className="text-center text-[10px] text-gray-400 py-4 font-mono">
        Proctored online test · Curcle HRMS
      </footer>
    </div>
  );
}
