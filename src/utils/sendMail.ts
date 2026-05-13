import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

const sendMail = async ({ to, subject, html }: MailOptions) => {
  await transporter.sendMail({
    from: `"ProFileGen" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

export default sendMail;