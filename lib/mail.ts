// lib/mail.ts

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.qq.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true, // 465 端口必须为 true
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(email: string, code: string) {
  const mailUser = process.env.SMTP_USER;

  const mailOptions = {
    // 🌟 QQ 邮箱要求发件人地址必须与登录账号 (SMTP_USER) 完全一致
    from: process.env.SMTP_FROM || `"EchoINTV" <${mailUser}>`,
    to: email,
    subject: `【EchoINTV】您的注册验证码是：${code}`,
    html: `
      <div style="max-width: 560px; margin: 0 auto; padding: 32px 24px; font-family: sans-serif; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #2563eb; font-size: 24px; font-weight: bold; margin: 0;">EchoINTV</h1>
          <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">高效备战技术面试，拿下一线大厂 Offer</p>
        </div>
        <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <p style="color: #475569; font-size: 14px; margin: 0 0 12px 0;">您正在申请注册 EchoINTV 账号，本次验证码为：</p>
          <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1e293b; font-family: monospace;">${code}</div>
          <p style="color: #94a3b8; font-size: 12px; margin: 12px 0 0 0;">验证码有效期为 10 分钟，请勿将验证码泄露给他人。</p>
        </div>
        <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; text-align: center; margin: 0;">
          如非本人操作，请忽略此邮件。
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}