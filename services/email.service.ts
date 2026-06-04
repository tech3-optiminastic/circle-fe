import { EmailTemplate, SentEmailLog } from '@/types';
import { nowISO, randomId } from '@/lib/utils';

export function buildSentEmail(
  template: EmailTemplate,
  recipientName: string,
  recipientEmail: string,
  fields: Record<string, string>,
): SentEmailLog {
  return {
    id: randomId('LOG', 9000, 1000),
    recipientName,
    recipientEmail,
    templateTitle: template.title,
    subject: template.subject.replace('{{ROLE}}', fields['{{ROLE}}'] || 'Position'),
    dateSent: nowISO(),
    status: 'Sent',
    relatedEntity: recipientName,
  };
}
