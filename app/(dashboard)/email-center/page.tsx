'use client';

import { EmailCenterView } from '@/components/SubViews';
import { PageLoading } from '@/components/PageLoading';
import { useEmailTemplates, useSentEmails, useTriggerEmail } from '@/features/email/hooks';

export default function EmailCenterPage() {
  const { data: emailTemplates = [], isLoading: l1 } = useEmailTemplates();
  const { data: sentMails = [], isLoading: l2 } = useSentEmails();
  const trigger = useTriggerEmail();

  if (l1 || l2) return <PageLoading />;

  return (
    <EmailCenterView
      emailTemplates={emailTemplates}
      sentMails={sentMails}
      onTriggerEmail={(templateId, recipientName, recipientEmail, fields) =>
        trigger.mutate({ templateId, recipientName, recipientEmail, fields })
      }
    />
  );
}
