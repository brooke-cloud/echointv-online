// lib/mail.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.qq.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(email: string, code: string) {
  const mailOptions = {
    from: process.env.SMTP_FROM || `"EchoINTV" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `【EchoINTV】您的注册验证码是：${code}`,
    html: `
      <div style="max-width: 560px; margin: 0 auto; padding: 32px 24px; font-family: sans-serif; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px;">
        <h1 style="color: #2563eb; font-size: 24px; font-weight: bold; text-align: center;">EchoINTV</h1>
        <p style="text-align: center; color: #4b5563;">您正在注册 EchoINTV，本次验证码为：</p>
        <div style="text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1e293b; margin: 20px 0;">${code}</div>
        <p style="text-align: center; color: #9ca3af; font-size: 12px;">验证码有效期 10 分钟，请勿泄露给他人。</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}