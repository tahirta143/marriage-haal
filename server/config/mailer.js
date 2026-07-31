const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host: host,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_PORT == 465,
      auth: { user, pass }
    });
  } else {
    // Generate test Ethereal SMTP transporter fallback if no SMTP configured
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log('📧 Created Ethereal Test Email Transporter for OTP delivery.');
    } catch (err) {
      console.warn('⚠️ Could not create Ethereal test account:', err.message);
    }
  }

  return transporter;
};

const sendOTPEmail = async (toEmail, otpCode) => {
  try {
    const mailTransporter = await getTransporter();
    if (!mailTransporter) {
      console.warn(`[OTP Notification] OTP Code for ${toEmail} is: ${otpCode}`);
      return false;
    }

    const info = await mailTransporter.sendMail({
      from: `"ShaadiPro Authentication" <${process.env.SMTP_FROM || 'noreply@shaadipro.com'}>`,
      to: toEmail,
      subject: `🔐 Your ShaadiPro Verification Code is ${otpCode}`,
      text: `Your ShaadiPro 6-digit verification code is: ${otpCode}. It expires in 10 minutes.`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #F0D5E2; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; padding-bottom: 16px; border-bottom: 1px solid #FAF5F7;">
            <h2 style="color: #AA336A; margin: 0; font-size: 24px;">ShaadiPro Verification</h2>
            <p style="color: #705562; font-size: 12px; margin-top: 4px;">Marriage Hall Booking & Operations Portal</p>
          </div>
          <div style="padding: 24px 0; text-align: center;">
            <p style="font-size: 14px; color: #22131A; margin-bottom: 16px;">Use the following 6-digit code to complete your login or registration:</p>
            <div style="display: inline-block; padding: 14px 28px; background-color: #FAF5F7; border: 2px dashed #AA336A; border-radius: 12px; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #AA336A;">
              ${otpCode}
            </div>
            <p style="font-size: 11px; color: #9E7D8C; margin-top: 16px;">This code will expire in 10 minutes. Do not share this code with anyone.</p>
          </div>
          <div style="text-align: center; border-top: 1px solid #FAF5F7; pt: 16px; font-size: 11px; color: #9E7D8C;">
            &copy; 2026 ShaadiPro. All rights reserved.
          </div>
        </div>
      `
    });

    console.log(`✅ OTP Email sent to ${toEmail}. Message ID: ${info.messageId}`);
    if (info.messageId && nodemailer.getTestMessageUrl(info)) {
      console.log(`🔗 Ethereal Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    return true;
  } catch (error) {
    console.error(`❌ Failed to send OTP email to ${toEmail}:`, error.message);
    return false;
  }
};

module.exports = { sendOTPEmail };
