'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Select } from './Select';
import { Button } from '@/components/ui/button';
import { Tip } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from './Toaster';
import { cn } from '@/lib/utils';
import { Job, JobStatus } from '../types';
import {
  Briefcase,
  Plus,
  X,
  Link2,
  Check,
  ExternalLink,
  Trash2,
  Users,
  MapPin,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from 'lucide-react';

type SortKey = 'title' | 'exp' | 'salary' | 'status' | 'applicants';

interface JobListViewProps {
  jobs: Job[];
  applicantCounts: Record<string, number>;
  onCreateJob: (job: Job) => void;
  onSetStatus: (id: string, status: JobStatus) => void;
  onDeleteJob: (id: string) => void;
}

const EMPTY_FORM = {
  title: '',
  department: 'Engineering',
  location: 'Remote',
  employmentType: 'Full-time' as Job['employmentType'],
  workMode: 'Hybrid' as Job['workMode'],
  minExperienceYears: 3,
  salaryMin: '',
  salaryMax: '',
  description: '',
  requirements: '',
};

function statusBadge(status: JobStatus): string {
  switch (status) {
    case 'Open':
      return 'bg-emerald-50 text-emerald-600';
    case 'Closed':
      return 'bg-red-50 text-red-600';
    case 'On Hold':
      return 'bg-yellow-50 text-yellow-600';
    default:
      return 'bg-[#E6E1D8] text-gray-500';
  }
}

export function JobListView({
  jobs,
  applicantCounts,
  onCreateJob,
  onSetStatus,
  onDeleteJob,
}: JobListViewProps) {
  const toast = useToast();
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({
    key: 'title',
    dir: 'asc',
  });

  const toggleSort = (key: SortKey) =>
    setSort(s => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
  const toNum = (s: string) => Number(String(s).replace(/[^0-9.]/g, '')) || 0;

  const openApplicants = (id: string) => router.push(`/jobs/${id}/applicants`);

  const publicUrl = (id: string) =>
    typeof window !== 'undefined' ? `${window.location.origin}/jobs/${id}` : `/jobs/${id}`;

  const copyLink = async (id: string) => {
    try {
      await navigator.clipboard.writeText(publicUrl(id));
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard API can be unavailable on insecure origins.
      toast.error('Could not copy the link — copy it from the address bar instead.');
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('A job title is required to publish the posting.');
      return;
    }
    const created: Job = {
      id: `JOB-${Math.floor(1000 + Math.random() * 9000)}`,
      title: form.title.trim(),
      department: form.department,
      location: form.location,
      employmentType: form.employmentType,
      workMode: form.workMode,
      minExperienceYears: Number(form.minExperienceYears),
      salaryMin: form.salaryMin,
      salaryMax: form.salaryMax,
      description: form.description,
      requirements: form.requirements,
      status: 'Open',
      postedBy: 'HR Specialist',
      postedDate: new Date().toISOString().split('T')[0],
    };
    onCreateJob(created);
    setShowAddForm(false);
    setForm(EMPTY_FORM);
    toast.success(`"${created.title}" published — copy its public link from the card.`);
  };

  const openCount = jobs.filter(j => j.status === 'Open').length;
  const closedCount = jobs.filter(j => j.status === 'Closed' || j.status === 'On Hold').length;
  const totalApplicants = Object.values(applicantCounts).reduce((a, b) => a + b, 0);

  const sortedJobs = [...jobs].sort((a, b) => {
    const dir = sort.dir === 'asc' ? 1 : -1;
    switch (sort.key) {
      case 'exp':
        return (a.minExperienceYears - b.minExperienceYears) * dir;
      case 'salary':
        return (toNum(a.salaryMin) - toNum(b.salaryMin)) * dir;
      case 'status':
        return a.status.localeCompare(b.status) * dir;
      case 'applicants':
        return ((applicantCounts[a.id] ?? 0) - (applicantCounts[b.id] ?? 0)) * dir;
      default:
        return a.title.localeCompare(b.title) * dir;
    }
  });

  // Sortable column header.
  const SortTh = ({
    k,
    label,
    className,
  }: {
    k: SortKey;
    label: string;
    className?: string;
  }) => (
    <th scope="col" className={cn('px-4 py-2.5 font-semibold', className)}>
      <button
        type="button"
        onClick={() => toggleSort(k)}
        className="inline-flex cursor-pointer items-center gap-1 uppercase transition-colors hover:text-gray-800"
      >
        {label}
        {sort.key === k ? (
          sort.dir === 'asc' ? (
            <ChevronUp size={11} className="text-accent-600" />
          ) : (
            <ChevronDown size={11} className="text-accent-600" />
          )
        ) : (
          <ChevronsUpDown size={11} className="text-gray-400" />
        )}
      </button>
    </th>
  );

  const stats = [
    { label: 'Total openings', value: jobs.length, dot: 'bg-accent-500' },
    { label: 'Live & open', value: openCount, dot: 'bg-emerald-500' },
    { label: 'Closed / hold', value: closedCount, dot: 'bg-gray-400' },
    { label: 'Applicants', value: totalApplicants, dot: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-5 text-xs select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center shrink-0">
            <Briefcase size={18} />
          </span>
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight font-display">
              Job Postings
            </h2>
            <p className="text-gray-500 text-[11px] max-w-md">
              Publish a role, share its public link, and collect applications straight into your
              candidate pipeline.
            </p>
          </div>
        </div>
        <button
          id="btn-post-job"
          onClick={() => setShowAddForm(true)}
          className="bg-accent-600 hover:bg-accent-700 text-white px-3.5 py-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition font-medium shrink-0 shadow-2xs"
        >
          <Plus size={15} /> Post New Job
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s => (
          <div
            key={s.label}
            className="bg-[#F7F4EE] border border-[#DAD4C8] rounded-xl px-4 py-3 shadow-2xs"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-gray-500">
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              {s.label}
            </div>
            <p className="text-xl font-bold text-gray-900 mt-1 tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Job cards grid */}
      {jobs.length === 0 ? (
        <div className="bg-[#F7F4EE] border border-dashed border-[#CFC8BA] rounded-2xl py-16 flex flex-col items-center gap-3 text-center px-6">
          <span className="w-14 h-14 rounded-2xl bg-accent-50 text-accent-500 flex items-center justify-center">
            <Briefcase size={26} />
          </span>
          <p className="font-bold text-gray-700 text-sm">No job postings yet</p>
          <p className="text-[11px] text-gray-500 max-w-xs">
            Post your first opening to generate a shareable public apply link.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-1 bg-accent-600 hover:bg-accent-700 text-white px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer transition font-medium"
          >
            <Plus size={14} /> Post New Job
          </button>
        </div>
      ) : (
        <div className="bg-[#F7F4EE] border border-[#DAD4C8] rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#ECE8E0] border-b border-[#DAD4C8] text-[10px] font-mono uppercase tracking-wider text-gray-500">
                  <SortTh k="title" label="Role" />
                  <th scope="col" className="font-semibold px-4 py-2.5">Location</th>
                  <th scope="col" className="font-semibold px-4 py-2.5">Type</th>
                  <SortTh k="exp" label="Exp." className="text-center" />
                  <SortTh k="salary" label="Salary" />
                  <SortTh k="status" label="Status" />
                  <SortTh k="applicants" label="Applicants" className="text-center" />
                  <th scope="col" className="font-semibold px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E1D8]">
                {sortedJobs.map(job => {
                  const count = applicantCounts[job.id] ?? 0;
                  return (
                    <tr
                      key={job.id}
                      onClick={() => openApplicants(job.id)}
                      className="hover:bg-[#ECE8E0] transition cursor-pointer align-middle"
                      title="View applicants for this role"
                    >
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-900 text-[13px]">{job.title}</div>
                        <div className="text-[10px] text-gray-500 font-mono">
                          {job.id} · {job.department}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin size={11} className="text-gray-500 shrink-0" /> {job.location}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-600 whitespace-nowrap">
                        {job.employmentType}
                        <span className="text-gray-400"> · {job.workMode}</span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-600 font-mono text-center whitespace-nowrap">
                        {job.minExperienceYears}+ yrs
                      </td>
                      <td className="px-4 py-3 text-[11px] font-mono text-accent-700 font-semibold whitespace-nowrap">
                        {job.salaryMin} – {job.salaryMax}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${statusBadge(job.status)}`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            openApplicants(job.id);
                          }}
                          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-700 hover:text-accent-700 cursor-pointer transition"
                          title="View applicants for this role"
                        >
                          <Users size={12} className="text-accent-600" />
                          {count}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={e => {
                              e.stopPropagation();
                              copyLink(job.id);
                            }}
                            className="font-mono font-semibold"
                            title="Copy public application link"
                          >
                            {copiedId === job.id ? (
                              <>
                                <Check size={11} className="text-emerald-600" /> Copied
                              </>
                            ) : (
                              <>
                                <Link2 size={11} /> Link
                              </>
                            )}
                          </Button>
                          <Button
                            asChild
                            variant="outline"
                            size="xs"
                            className="font-mono font-semibold"
                            title="Open public posting"
                          >
                            <a
                              href={publicUrl(job.id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                            >
                              <ExternalLink size={11} /> View
                            </a>
                          </Button>
                          <Tip label={job.status === 'Open' ? 'Close this posting' : 'Reopen this posting'}>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={e => {
                                e.stopPropagation();
                                onSetStatus(job.id, job.status === 'Open' ? 'Closed' : 'Open');
                              }}
                              className="text-gray-500 hover:text-gray-800"
                              aria-label={job.status === 'Open' ? 'Close this posting' : 'Reopen this posting'}
                            >
                              {job.status === 'Open' ? <Lock size={12} /> : <Unlock size={12} />}
                            </Button>
                          </Tip>
                          <Tip label="Delete posting">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={e => {
                                e.stopPropagation();
                                toast.confirm({
                                  title: `Delete "${job.title}"?`,
                                  description: 'This cannot be undone.',
                                  confirmLabel: 'Delete',
                                  onConfirm: () => onDeleteJob(job.id),
                                });
                              }}
                              className="text-gray-500 hover:bg-red-50 hover:text-red-600"
                              aria-label="Delete posting"
                            >
                              <Trash2 size={12} />
                            </Button>
                          </Tip>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create job modal */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="shrink-0 border-b border-border px-6 py-4 text-left">
            <DialogTitle className="font-mono text-xs font-bold uppercase tracking-wider text-gray-900">
              Publish a New Job Opening
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-8 overflow-y-auto px-6 py-6">
              {/* Role */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <h2 className="font-semibold text-foreground">Role</h2>
                  <p className="mt-1 text-xs leading-6 text-muted-foreground">
                    Title, team and location.
                  </p>
                </div>
                <div className="md:col-span-2">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label htmlFor="job-title" className="text-sm font-medium">
                        Job title
                      </Label>
                      <Input
                        id="job-title"
                        placeholder="e.g. Senior React Engineer"
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        className="mt-2"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Department</Label>
                      <Select
                        value={form.department}
                        onChange={e => setForm({ ...form, department: e.target.value })}
                        className="mt-2 h-9 w-full rounded-md border border-input bg-secondary/50 px-3 text-sm shadow-xs"
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Product">Product</option>
                        <option value="Design">Design</option>
                        <option value="Sales">Sales</option>
                        <option value="Human Resources">Human Resources</option>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="job-location" className="text-sm font-medium">
                        Location
                      </Label>
                      <Input
                        id="job-location"
                        placeholder="e.g. San Francisco / Remote"
                        value={form.location}
                        onChange={e => setForm({ ...form, location: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Details */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <h2 className="font-semibold text-foreground">Details</h2>
                  <p className="mt-1 text-xs leading-6 text-muted-foreground">
                    Employment terms and compensation.
                  </p>
                </div>
                <div className="md:col-span-2">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium">Employment type</Label>
                      <Select
                        value={form.employmentType}
                        onChange={e =>
                          setForm({ ...form, employmentType: e.target.value as Job['employmentType'] })
                        }
                        className="mt-2 h-9 w-full rounded-md border border-input bg-secondary/50 px-3 text-sm shadow-xs"
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                        <option value="Temporary">Temporary</option>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Work mode</Label>
                      <Select
                        value={form.workMode}
                        onChange={e => setForm({ ...form, workMode: e.target.value as Job['workMode'] })}
                        className="mt-2 h-9 w-full rounded-md border border-input bg-secondary/50 px-3 text-sm shadow-xs"
                      >
                        <option value="Onsite">Onsite</option>
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="job-exp" className="text-sm font-medium">
                        Min exp. (yrs)
                      </Label>
                      <Input
                        id="job-exp"
                        type="number"
                        min={0}
                        value={form.minExperienceYears}
                        onChange={e =>
                          setForm({ ...form, minExperienceYears: Number(e.target.value) })
                        }
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="job-smin" className="text-sm font-medium">
                        Salary — min
                      </Label>
                      <Input
                        id="job-smin"
                        placeholder="$120,000"
                        value={form.salaryMin}
                        onChange={e => setForm({ ...form, salaryMin: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="job-smax" className="text-sm font-medium">
                        Salary — max
                      </Label>
                      <Input
                        id="job-smax"
                        placeholder="$160,000"
                        value={form.salaryMax}
                        onChange={e => setForm({ ...form, salaryMax: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <h2 className="font-semibold text-foreground">Description</h2>
                  <p className="mt-1 text-xs leading-6 text-muted-foreground">
                    Role overview and requirements.
                  </p>
                </div>
                <div className="space-y-4 md:col-span-2">
                  <div>
                    <Label htmlFor="job-desc" className="text-sm font-medium">
                      Detailed description
                    </Label>
                    <Textarea
                      id="job-desc"
                      placeholder="Describe the role, responsibilities, team and impact…"
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      rows={4}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="job-req" className="text-sm font-medium">
                      Requirements (one per line)
                    </Label>
                    <Textarea
                      id="job-req"
                      placeholder={'5+ years React experience\nStrong system design skills\n…'}
                      value={form.requirements}
                      onChange={e => setForm({ ...form, requirements: e.target.value })}
                      rows={3}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button type="submit">Publish Job &amp; Get Link</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default JobListView;
