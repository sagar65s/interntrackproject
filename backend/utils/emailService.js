const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || `InternTrack <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent to:', to, '| ID:', result.messageId);
    return { success: true };
  } catch (error) {
    console.error('❌ Email error:', error.message);
    return { success: false, error: error.message };
  }
};

const adminMessageTemplate = (studentName, message, adminName) => ({
  subject: `📢 Message from InternTrack Admin`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0F172A;border-radius:12px;overflow:hidden;">
      <div style="background:#3B82F6;padding:28px 32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:1px;">📋 InternTrack</h1>
        <p style="color:#BFDBFE;margin:6px 0 0;font-size:14px;">Internship Management System</p>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#E2E8F0;margin:0 0 8px;">Hello, ${studentName}! 👋</h2>
        <p style="color:#94A3B8;margin:0 0 20px;font-size:14px;">You have received a new message from your admin:</p>
        <div style="background:#1E293B;border-left:4px solid #3B82F6;padding:20px 24px;border-radius:0 8px 8px 0;margin-bottom:24px;">
          <p style="color:#E2E8F0;margin:0;line-height:1.7;font-size:15px;">${message}</p>
        </div>
        <p style="color:#64748B;font-size:13px;margin:0;">
          Sent by: <strong style="color:#94A3B8;">${adminName}</strong><br/>
          <span style="font-size:12px;">via InternTrack Admin Portal</span>
        </p>
      </div>
      <div style="background:#1E293B;padding:18px 32px;text-align:center;border-top:1px solid #2D3F55;">
        <p style="color:#475569;font-size:12px;margin:0;">© 2024 InternTrack. This is an automated message — please do not reply to this email.</p>
      </div>
    </div>
  `
});

module.exports = { sendEmail, adminMessageTemplate };
