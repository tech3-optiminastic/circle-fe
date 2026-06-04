/** Centralized query-key factory — avoids stringly-typed keys scattered in hooks. */
export const qk = {
  candidates: { all: ['candidates'] as const, detail: (id: string) => ['candidates', id] as const },
  interviews: { all: ['interviews'] as const },
  iqTests: { all: ['iq-tests'] as const },
  assignments: { all: ['assignments'] as const },
  bgvs: { all: ['bgvs'] as const },
  onboarding: { all: ['onboarding'] as const },
  employees: { all: ['employees'] as const, detail: (id: string) => ['employees', id] as const },
  assets: { all: ['assets'] as const },
  emailTemplates: { all: ['email-templates'] as const },
  sentEmails: { all: ['sent-emails'] as const },
  offboarding: { all: ['offboarding'] as const },
} as const;
