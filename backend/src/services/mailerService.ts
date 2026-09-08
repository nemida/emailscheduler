import nodemailer, { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

export async function getTransporter() {
  if (transporter) return transporter;

  const testAccount = await nodemailer.createTestAccount();

  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  console.log('Ethereal account created:', testAccount.user);

  return transporter;
}

export async function sendEmail(options: {
  from: string;
  to: string;
  subject: string;
  html: string;
}) {
  const transport = await getTransporter();

  const info = await transport.sendMail({
    from: options.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  console.log('Email sent. Preview:', previewUrl);

  return { messageId: info.messageId, previewUrl };
}
