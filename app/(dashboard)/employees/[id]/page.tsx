'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  CalendarDays,
  Wallet,
  Landmark,
  ShieldCheck,
  Fingerprint,
  FileSignature,
  ScrollText,
  Building2,
  PenLine,
  CheckCircle2,
  XCircle,
  Clock4,
  KeyRound,
  Laptop,
  Award,
} from 'lucide-react';
import { useEmployees } from '@/features/employees/hooks';
import { useBgvs } from '@/features/candidates/hooks';
import { useDocRequests } from '@/features/doc-requests/hooks';
import { PageLoading } from '@/components/PageLoading';
import { DocumentsPanel } from '@/components/DocumentsPanel';

const fmtDate = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';

  const { data: employees = [], isLoading } = useEmployees();
  const { data: bgvs = [] } = useBgvs();
  const { data: docRequests = [] } = useDocRequests();

  const employee = employees.find(e => e.id === id);

  if (isLoading) return <PageLoading />;
  if (!employee) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-sm font-semibold text-gray-700">Employee not found</p>
        <Link href="/directory" className="mt-3 inline-block text-xs font-semibold text-accent-600 hover:underline">
          ← Back to directory
        </Link>
      </div>
    );
  }

  const cid = employee.candidateId;
  const bgv = cid ? bgvs.find(b => b.candidateId === cid) : undefined;
  const docRequest = cid
    ? docRequests
        .filter(r => r.candidateId === cid)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    : undefined;

  const credentials = employee.credentials ?? [];
  const assets = employee.assets ?? [];
  const bank = docRequest?.bankDetails;
  const j = employee.joining;

  const milestones = [
    { Icon: FileSignature, label: 'Offer letter sent', at: j?.offerLetterSentAt },
    { Icon: PenLine, label: 'Signed offer received', at: j?.offerSignedReceivedAt },
    { Icon: Building2, label: 'Office invite sent', at: j?.officeInviteSentAt },
    { Icon: ScrollText, label: 'Letter of appointment sent', at: j?.appointmentLetterSentAt },
  ];

  const statusTone =
    employee.status === 'Active'
      ? 'bg-emerald-50 text-emerald-600'
      : employee.status === 'Offboarded'
        ? 'bg-red-50 text-red-600'
        : 'bg-yellow-50 text-yellow-600';

  return (
    <div className="space-y-5 text-xs">
      <Link
        href="/directory"
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 hover:text-accent-600"
      >
        <ArrowLeft size={13} /> Back to directory
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 rounded-xl border border-[#DAD4C8] bg-[#F7F4EE] p-5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 text-lg font-bold text-white">
            {employee.fullName.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <h1 className="font-display text-lg font-bold text-gray-900">{employee.fullName}</h1>
            <p className="text-[12px] text-gray-500">
              {employee.role} · {employee.department}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold ${statusTone}`}>
                {employee.status}
              </span>
              <span className="font-mono text-[10px] text-gray-400">{employee.id}</span>
              <span className="font-mono text-[10px] text-gray-400">· joined {fmtDate(employee.joiningDate)}</span>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[#E2DDD2] bg-[#F2EEE7] px-4 py-3 text-center">
          <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-gray-400">Annual CTC</p>
          <p className="mt-0.5 text-base font-bold text-gray-900">{employee.annualCtc || '—'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left / main */}
        <div className="space-y-5 lg:col-span-2">
          {/* Compensation */}
          <Card icon={<Wallet size={14} />} title="Compensation">
            <div className="grid grid-cols-2 gap-4">
              <KV k="Annual CTC" v={employee.annualCtc || '—'} />
              <KV k="Source" v={cid ? 'From accepted offer' : 'Set manually'} />
            </div>
          </Card>

          {/* Offer & signed papers */}
          <Card icon={<FileSignature size={14} />} title="Offer & signed papers">
            <div className="space-y-2">
              {milestones.map(m => {
                const M = m.Icon;
                const done = Boolean(m.at);
                return (
                  <div key={m.label} className="flex items-center justify-between gap-2 border-b border-[#E2DDD2] pb-1.5 last:border-0">
                    <span className="flex items-center gap-2 text-[12px] text-gray-700">
                      <M size={13} className={done ? 'text-emerald-500' : 'text-gray-300'} />
                      {m.label}
                    </span>
                    <span className={`font-mono text-[11px] ${done ? 'text-gray-600' : 'text-gray-400'}`}>
                      {done ? fmtDate(m.at) : 'Not recorded'}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Bank details */}
          <Card icon={<Landmark size={14} />} title="Bank details">
            {bank?.accountNumber ? (
              <div className="grid grid-cols-2 gap-4">
                <KV k="Account holder" v={bank.accountHolderName || employee.fullName} />
                <KV k="Bank" v={bank.bankName || '—'} />
                <KV k="Account number" v={bank.accountNumber} />
                <KV k="IFSC" v={bank.ifscCode} />
              </div>
            ) : (
              <p className="text-[11px] text-gray-500">
                {employee.personalDetails?.bankAccount || 'No bank details on file.'}
              </p>
            )}
          </Card>

          {/* BGV report */}
          <Card icon={<Fingerprint size={14} />} title="Background verification report">
            {bgv ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-gray-600">Overall status</span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                      bgv.overallStatus === 'Verified'
                        ? 'bg-emerald-50 text-emerald-600'
                        : bgv.overallStatus === 'Rejected'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-yellow-50 text-yellow-600'
                    }`}
                  >
                    {bgv.overallStatus}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {bgv.documents.map(d => (
                    <div key={d.type} className="flex items-center justify-between border-b border-[#E2DDD2] pb-1 text-[11px] last:border-0">
                      <span className="flex items-center gap-1.5 text-gray-700">
                        {d.status === 'Verified' ? (
                          <CheckCircle2 size={12} className="text-emerald-500" />
                        ) : d.status === 'Rejected' ? (
                          <XCircle size={12} className="text-red-500" />
                        ) : (
                          <Clock4 size={12} className="text-gray-400" />
                        )}
                        {d.type}
                      </span>
                      <span className="font-mono text-gray-500">{d.status}</span>
                    </div>
                  ))}
                </div>
                {bgv.verificationTimeline?.length > 0 && (
                  <div className="rounded-lg bg-[#F2EEE7] p-2.5">
                    <p className="mb-1 font-mono text-[9px] font-bold uppercase tracking-wider text-gray-400">Timeline</p>
                    <ul className="space-y-1">
                      {bgv.verificationTimeline.map((t, i) => (
                        <li key={i} className="flex justify-between gap-2 text-[11px] text-gray-600">
                          <span>{t.action}</span>
                          <span className="shrink-0 font-mono text-gray-400">{fmtDate(t.date)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-gray-500">No background verification record linked.</p>
            )}
          </Card>

          {/* Documents */}
          {cid && (
            <DocumentsPanel
              entityType="candidate"
              entityId={cid}
              title="Joining documents (verified at onboarding)"
              previewOnly
            />
          )}
          <DocumentsPanel entityType="employee" entityId={employee.id} category="document" title="Important documents" />
        </div>

        {/* Right / sidebar */}
        <div className="space-y-5">
          <Card icon={<Briefcase size={14} />} title="Job details">
            <div className="space-y-2.5">
              <KV k="Reporting manager" v={employee.reportingManager} />
              <KV k="Work location" v={employee.workLocation} />
              <KV k="Joining date" v={fmtDate(employee.joiningDate)} />
              <KV k="Department" v={employee.department} />
            </div>
          </Card>

          <Card icon={<Mail size={14} />} title="Contact & personal">
            <div className="space-y-2">
              <Detail icon={<Mail size={13} />} value={employee.email} />
              <Detail icon={<Phone size={13} />} value={employee.phone || '—'} />
              <Detail icon={<MapPin size={13} />} value={employee.personalDetails?.address || '—'} />
              <Detail icon={<CalendarDays size={13} />} value={`Emergency: ${employee.personalDetails?.emergencyContact || '—'}`} />
            </div>
          </Card>

          <Card icon={<KeyRound size={14} />} title={`Credentials (${credentials.length})`}>
            {credentials.length ? (
              <div className="space-y-1.5">
                {credentials.map(c => (
                  <div key={c.id} className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="truncate text-gray-700">{c.systemName}</span>
                    <span className="shrink-0 font-mono text-gray-400">{c.accessLevel} · {c.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-gray-500">No system access granted yet.</p>
            )}
          </Card>

          <Card icon={<Laptop size={14} />} title={`Assets (${assets.length})`}>
            {assets.length ? (
              <div className="space-y-1.5">
                {assets.map(a => (
                  <div key={a.id} className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="truncate text-gray-700">{a.assetName}</span>
                    <span className="shrink-0 font-mono text-gray-400">{a.serialNumber}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-gray-500">No hardware assigned.</p>
            )}
          </Card>

          <Card icon={<Award size={14} />} title="Appraisal history">
            {employee.appraisalHistory && employee.appraisalHistory.length ? (
              <div className="space-y-2">
                {employee.appraisalHistory.map(ap => (
                  <div key={ap.id} className="rounded-lg bg-[#F2EEE7] p-2.5">
                    <div className="flex justify-between font-mono text-[9px] font-bold">
                      <span className="text-accent-600 uppercase">{ap.reviewPeriod}</span>
                      <span className="text-emerald-600">⭐ {ap.performanceScore}/5</span>
                    </div>
                    <p className="mt-1 text-[11px] italic text-gray-600">“{ap.managerFeedback}”</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-gray-500">No appraisals filed yet.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#DAD4C8] bg-[#F7F4EE] p-4 shadow-2xs">
      <h3 className="mb-3 flex items-center gap-1.5 border-b border-[#E6E1D8] pb-2 text-[12px] font-bold text-gray-900">
        <span className="text-accent-600">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="font-mono text-[9px] font-bold uppercase tracking-wide text-gray-400">{k}</p>
      <p className="text-[12px] font-medium text-gray-700">{v || '—'}</p>
    </div>
  );
}

function Detail({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-start gap-2 text-[12px] text-gray-700">
      <span className="mt-0.5 text-accent-600">{icon}</span>
      <span className="min-w-0 break-words">{value}</span>
    </div>
  );
}
