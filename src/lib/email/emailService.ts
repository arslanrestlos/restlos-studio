// lib/email/emailService.ts
import { Resend } from 'resend';
import { getOTPTemplate } from './templates/otpTemplate';
import { getVerificationSuccessTemplate } from './templates/verificationSuccessTemplate';
import { getWelcomeTemplate } from './templates/welcomeTemplate';
import { EmailTemplateData } from './baseTemplate';

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  private static fromAddress = 'Arslan Studio <info@restlos-studio.de>';

  static async sendOTPEmail(data: EmailTemplateData & { otp: string }) {
    try {
      const template = getOTPTemplate(data);

      const result = await resend.emails.send({
        from: this.fromAddress,
        to: [data.email],
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      console.log('OTP-E-Mail erfolgreich versendet:', result.data?.id);
      return { success: true, messageId: result.data?.id };
    } catch (error) {
      console.error('OTP-E-Mail Fehler:', error);
      throw new Error('OTP-E-Mail konnte nicht versendet werden');
    }
  }

  static async sendVerificationSuccessEmail(data: EmailTemplateData) {
    try {
      const template = getVerificationSuccessTemplate(data);

      const result = await resend.emails.send({
        from: this.fromAddress,
        to: [data.email],
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      console.log(
        'Bestätigungs-E-Mail erfolgreich versendet:',
        result.data?.id
      );
      return { success: true, messageId: result.data?.id };
    } catch (error) {
      console.error('Bestätigungs-E-Mail Fehler:', error);
      throw new Error('Bestätigungs-E-Mail konnte nicht versendet werden');
    }
  }

  static async sendWelcomeEmail(data: EmailTemplateData) {
    try {
      const template = getWelcomeTemplate(data);

      const result = await resend.emails.send({
        from: this.fromAddress,
        to: [data.email],
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      console.log('Willkommens-E-Mail erfolgreich versendet:', result.data?.id);
      return { success: true, messageId: result.data?.id };
    } catch (error) {
      console.error('Willkommens-E-Mail Fehler:', error);
      throw new Error('Willkommens-E-Mail konnte nicht versendet werden');
    }
  }
}
