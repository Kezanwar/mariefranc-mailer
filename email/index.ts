import nodemailer from "nodemailer";
import { AttachmentLike } from "nodemailer/lib/mailer";
import SMTPPool from "nodemailer/lib/smtp-pool";
import { Readable } from "stream";

class EmailService {
  static pool: nodemailer.Transporter<
    SMTPPool.SentMessageInfo,
    SMTPPool.Options
  >;

  static initializePool() {
    this.pool = nodemailer.createTransport({
      service: "gmail",
      pool: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }

  static closePool() {
    this.pool.close();
  }

  static async send(
    to: string,
    subject: string,
    html: string | Buffer | Readable | AttachmentLike | undefined
  ) {
    try {
      const info = await this.pool.sendMail({
        to: to,
        from: process.env.GMAIL_USER,
        subject,
        html,
      });
      console.log("email sent: " + info.response);
    } catch (error) {
      console.log("email rejected: ", error);
      throw error;
    }
    return;
  }

  static sleep(duration = 2000) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("");
      }, duration);
    });
  }
}

export default EmailService;
