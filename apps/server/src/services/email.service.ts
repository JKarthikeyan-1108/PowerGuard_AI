import nodemailer from 'nodemailer';
import logger from '../config/logger';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER || 'leola.murphy@ethereal.email',
        pass: process.env.SMTP_PASS || 'd87x9uMh8M4X99ZpTf'
      }
    });
  }

  async sendEmail(options: { to: string; subject: string; text: string; attachments?: any[] }) {
    try {
      const info = await this.transporter.sendMail({
        from: '"PowerGuard System" <reports@powerguard.com>',
        to: options.to,
        subject: options.subject,
        text: options.text,
        attachments: options.attachments
      });

      logger.info(`Email sent successfully to ${options.to}. Message ID: ${info.messageId}`);
      if (nodemailer.getTestMessageUrl(info)) {
        logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
      return true;
    } catch (error: any) {
      logger.error(`Error sending email to ${options.to}: ${error.message}`);
      return false;
    }
  }

  async sendReportEmail(to: string, subject: string, body: string, attachmentBuffer: Buffer, filename: string) {
    return this.sendEmail({
      to,
      subject,
      text: body,
      attachments: [{ filename, content: attachmentBuffer }]
    });
  }

  async sendBasicEmail(to: string, subject: string, body: string) {
    return this.sendEmail({
      to,
      subject,
      text: body
    });
  }
}

export const emailService = new EmailService();
