import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly log = new Logger(MailService.name);
  private readonly resend: Resend | null;

  constructor(private readonly config: ConfigService) {
    const key = this.config.get<string>('RESEND_API_KEY');
    this.resend = key ? new Resend(key) : null;
  }

  async sendTransactional(opts: { to: string; subject: string; html: string }) {
    if (!this.resend) {
      this.log.warn(`Resend disabled; would email ${opts.to}: ${opts.subject}`);
      return { id: 'skipped' };
    }
    const from = this.config.getOrThrow<string>('EMAIL_FROM');
    return this.resend.emails.send({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
  }
}
