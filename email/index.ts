import nodemailer from "nodemailer";
import { renderFile } from "ejs";
import fs from "node:fs/promises";
import Mail from "nodemailer/lib/mailer";
import { readFile, writeFile } from "fs/promises";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

type TemplateProps = {
  receiver: string;
  title: string;
  content: string[];
};

export type SendMailProps = {
  to: string;
  receiver: string;
};

class EmailService {
  static fakeLongLoadPromise(duration = 2000) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("");
      }, duration);
    });
  }

  static async send(mailOptions: Mail.Options) {
    try {
      const info = await transporter.sendMail(mailOptions);
      // await this.createTestEmailHTMLFile(mailOptions.html);
      console.log("email sent: " + info.response);
    } catch (error) {
      console.log("email error");
      console.error(error);
    }
  }

  static async createTestEmailHTMLFile(content) {
    try {
      await fs.writeFile("test.html", content);
    } catch (err) {
      console.log(err);
    }
  }

  //html templates
  static createEmailTemplateHTML(data: TemplateProps) {
    return renderFile(process.cwd() + "/email/template.ejs", data);
  }

  static async sendAvailabilityTemplate(to: SendMailProps) {
    const html = await this.createEmailTemplateHTML({
      receiver: to.receiver,
      title: "Band Availability for Gigs in September/October",
      content: [
        "We’re a Manchester-based band looking to book gigs for this autumn, ideally in September or October.",
        "We’re open to both support or headline slots, though we currently feel more suited to support roles. As a six-piece band, we’ve had some great experiences, including radio play, previous gigs, and interest from major labels and management.",
        "We’d love the opportunity to perform at your venue.",
        'Heres a link to our latest release <a href="https://open.spotify.com/track/1LEG39QEB3rN8NYDRp8ubV?si=58b48d8b33e14d1b" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://open.spotify.com/track/1LEG39QEB3rN8NYDRp8ubV?si%3D58b48d8b33e14d1b&amp;source=gmail&amp;ust=1723735624022000&amp;usg=AOvVaw1udHgC5hZg8ykcEttV6_rK">"Alice"</a>.',
      ],
    });
    await this.send({
      to: to.to,
      from: process.env.GMAIL_USER,
      subject: "Band Availability for Gigs in September/October",
      html,
    });
    await this.fakeLongLoadPromise();
  }
}

export default EmailService;
