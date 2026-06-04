'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { EmailTemplate } from '@/types';
import { repositories } from '@/lib/api/repositories';
import { qk } from '@/lib/query/keys';
import { buildSentEmail } from '@/services/email.service';

export function useEmailTemplates() {
  return useQuery({ queryKey: qk.emailTemplates.all, queryFn: () => repositories.emailTemplates.list() });
}

export function useSentEmails() {
  return useQuery({ queryKey: qk.sentEmails.all, queryFn: () => repositories.sentEmails.list() });
}

export function useTriggerEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      templateId: string;
      recipientName: string;
      recipientEmail: string;
      fields: Record<string, string>;
    }) => {
      const templates = qc.getQueryData<EmailTemplate[]>(qk.emailTemplates.all) ?? [];
      const template = templates.find(t => t.id === input.templateId);
      if (!template) return;
      await repositories.sentEmails.create(
        buildSentEmail(template, input.recipientName, input.recipientEmail, input.fields),
      );
    },
    onSettled: () => qc.invalidateQueries({ queryKey: qk.sentEmails.all }),
  });
}
