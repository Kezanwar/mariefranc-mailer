import nodemailer from "nodemailer";
import { renderFile } from "ejs";
import fs from "node:fs/promises";
import Mail from "nodemailer/lib/mailer";
import { readFile, writeFile } from "fs/promises";

const transporter = nodemailer.createTransport({
  service: "gmail",
  pool: true,
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

  static closeTransporter() {
    transporter.close();
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

  static async sendTravsEmail(to: string) {
    return this.send({
      to: to,
      from: process.env.GMAIL_USER,
      subject: "Marie Franc New Single - Leave The Light On",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <p>Hello!</p>
          
          <p>I'm excited to share the press release for Marie Franc's upcoming single, 'Leave The Light On', set for release on 22nd August.</p>
          
          <p>This track is the band's second single of the year and the second release from their debut EP Saturday Boy, following an early spin on BBC Introducing Manchester. 'Leave The Light On' blends dream pop and soul-tinged indie, with sultry guitar textures and emotionally rich vocals that create an intimate, evocative sound.</p>
          
          <p>Marie Franc is gaining momentum, with a sold-out headline show and a main stage performance at Moovin Festival alongside Ezra Collective. More live dates are coming this autumn.</p>
          
          <p>Click here to listen to the preview :)</p>
          
          <p>We've put together a <a href="https://drive.google.com/drive/folders/17o5EA-gr6yWVCR1GA_lYim-DX1UgJqCd?usp=sharing" target="_blank">Google Drive</a> with press assets, including the music video, press release, and other materials. We'd love to collaborate on any press opportunities!</p>
          
          <p>Many thanks,<br>
          Bonnie</p>
        </div>
      `,
    });
  }

  static printSting(str: string) {
    console.log(str);
  }
}

export default EmailService;
