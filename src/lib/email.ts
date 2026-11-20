import nodemailer from 'nodemailer';

export async function sendBookingEmail(
  to: string,
  subject: string,
  text: string,
  html?: string
) {
  try {
    let transporter: nodemailer.Transporter;

    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const port = Number(process.env.SMTP_PORT ?? 587);

    if (host && user && pass) {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    } else {
      // Fallback to a test account in development when real SMTP is not configured
      const test = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: { user: test.user, pass: test.pass },
      });
    }

    const info = await transporter.sendMail({
      from: `"Jayjay Rides" <${process.env.FROM_EMAIL ?? "no-reply@jayjayrides.co.ke"}>`,
      to,
      subject,
      text,
      html,
    });

    // If using Ethereal, log a preview URL to help local development
    if (nodemailer.getTestMessageUrl && info) {
      const url = nodemailer.getTestMessageUrl(info);
      if (url) console.info("Preview email:", url);
    }
  } catch (err) {
    // Log and swallow email errors so booking/payment flows continue
    console.error("sendBookingEmail failed:", err);
  }
}