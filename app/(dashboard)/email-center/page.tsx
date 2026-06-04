'use client';

import { EmailCenterView } from '@/components/SubViews';
import { useEmailTemplates, useSentEmails, useTriggerEmail } from '@/features/email/hooks';

export default function EmailCenterPage() {
  const { data: emailTemplates = [] } = useEmailTemplates();
  const { data: sentMails = [] } = useSentEmails();
  const trigger = useTriggerEmail();

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
