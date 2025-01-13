import { EmailType } from '../../../database/models/email.entity';
import { EmailData } from '../../../email/services/email.service';

export class EmailSentEvent {
  constructor(
    public readonly payload: EmailData,
    public readonly type: EmailType,
  ) {}
}
