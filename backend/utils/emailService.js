import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded
dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * Test and verify SMTP configuration on server startup.
 */
export const verifyEmailConnection = async () => {
  const transporter = createTransporter();
  if (!transporter) return;

  try {
    await transporter.verify();
    console.log('✅ [Nodemailer] SMTP Server is ready to send emails');
  } catch (error) {
    if (error.message.includes('535') || error.message.includes('BadCredentials')) {
      console.warn('⚠️  [Nodemailer] Gmail rejected login. Please use a 16-character Google App Password (not your Gmail account password).');
    } else {
      console.warn(`⚠️  [Nodemailer] SMTP connection warning: ${error.message}`);
    }
  }
};

/**
 * Configure Nodemailer transporter.
 * If credentials are provided in .env, connects to SMTP.
 * Otherwise returns null to trigger fallback.
 */
const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (user && pass && user.trim() !== '' && pass.trim() !== '') {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false, // true for port 465, false for 587
      auth: {
        user: user.trim(),
        pass: pass.trim().replace(/\s+/g, ''), // remove any inadvertent spaces from Google App Password
      },
    });
  }

  return null;
};

/**
 * Send email when an employee applies for a leave (notifies managers).
 */
export const sendLeaveAppliedEmail = async ({ managerEmails = [], employeeName, department, leaveType, startDate, endDate, totalDays, reason }) => {
  const transporter = createTransporter();

  // If no managers in database yet, fallback to the configured EMAIL_USER so alert is never lost
  const recipients = (managerEmails && managerEmails.length > 0) 
    ? managerEmails 
    : (process.env.EMAIL_USER ? [process.env.EMAIL_USER] : []);

  if (!transporter) {
    console.log(`📧 [Email Simulation] New leave application from ${employeeName} (${totalDays} day(s) ${leaveType}). Configure EMAIL_USER and a 16-character Google App Password in .env to send real emails.`);
    return;
  }

  if (recipients.length === 0) {
    console.warn(`⚠️  [Nodemailer] No recipient email found for leave application from ${employeeName}.`);
    return;
  }

  const subject = `[LeaveEase] New Leave Application: ${employeeName} (${department})`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 18px 24px; border-radius: 8px; color: white;">
        <h2 style="margin: 0; font-size: 20px;">LeaveEase - New Leave Request</h2>
      </div>
      <div style="padding: 20px 0; color: #1e293b;">
        <p>Hello Manager,</p>
        <p>A new leave application has been submitted by <strong>${employeeName}</strong> from the <strong>${department}</strong> department.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: #f8fafc; border-radius: 8px;">
          <tr>
            <td style="padding: 10px 14px; font-weight: bold; color: #64748b; font-size: 13px;">Leave Type:</td>
            <td style="padding: 10px 14px; text-transform: capitalize; font-weight: bold; color: #4f46e5;">${leaveType} Leave</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-weight: bold; color: #64748b; font-size: 13px;">Duration:</td>
            <td style="padding: 10px 14px; color: #0f172a;">${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()} (${totalDays} working day(s))</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-weight: bold; color: #64748b; font-size: 13px;">Reason:</td>
            <td style="padding: 10px 14px; color: #0f172a;">${reason}</td>
          </tr>
        </table>

        <p>Please log in to the <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/manager/dashboard" style="color: #4f46e5; font-weight: bold;">Manager Portal</a> to review team availability and approve or reject this request.</p>
      </div>
      <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #94a3b8; text-align: center;">
        Automated notification from LeaveEase Employee Leave Management System
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"LeaveEase Notifications" <${process.env.EMAIL_USER}>`,
      to: recipients.join(', '),
      subject,
      html,
    });
    console.log(`✅ [Nodemailer] Leave application email successfully sent to: ${recipients.join(', ')} (Message ID: ${info.messageId})`);
  } catch (err) {
    console.error(`❌ [Nodemailer] Email send error: ${err.message}`);
  }
};

/**
 * Send email when a manager approves or rejects a leave request (notifies the employee).
 */
export const sendLeaveStatusEmail = async ({ employeeEmail, employeeName, leaveType, startDate, endDate, totalDays, status, managerComment }) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`📧 [Email Simulation] Leave ${status} email to ${employeeEmail || 'employee'}. Configure EMAIL_USER and a 16-character Google App Password in .env to send real emails.`);
    return;
  }

  if (!employeeEmail) {
    console.warn(`⚠️  [Nodemailer] No recipient email specified for employee decision alert.`);
    return;
  }

  const isApproved = status === 'Approved';
  const subject = `[LeaveEase] Leave Request ${status}: ${totalDays} day(s) of ${leaveType} leave`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="background: ${isApproved ? '#059669' : '#dc2626'}; padding: 18px 24px; border-radius: 8px; color: white;">
        <h2 style="margin: 0; font-size: 20px;">LeaveEase - Leave Request ${status}</h2>
      </div>
      <div style="padding: 20px 0; color: #1e293b;">
        <p>Hello ${employeeName},</p>
        <p>Your leave request has been reviewed by your manager and marked as <strong style="color: ${isApproved ? '#059669' : '#dc2626'}; font-size: 15px;">${status}</strong>.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: #f8fafc; border-radius: 8px;">
          <tr>
            <td style="padding: 10px 14px; font-weight: bold; color: #64748b; font-size: 13px;">Leave Type:</td>
            <td style="padding: 10px 14px; text-transform: capitalize; font-weight: bold;">${leaveType} Leave</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-weight: bold; color: #64748b; font-size: 13px;">Dates:</td>
            <td style="padding: 10px 14px; color: #0f172a;">${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()} (${totalDays} day(s))</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-weight: bold; color: #64748b; font-size: 13px;">Status:</td>
            <td style="padding: 10px 14px; font-weight: bold; color: ${isApproved ? '#059669' : '#dc2626'};">${status}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-weight: bold; color: #64748b; font-size: 13px;">Manager Remarks:</td>
            <td style="padding: 10px 14px; font-style: italic; color: #334155;">${managerComment || 'No remarks provided.'}</td>
          </tr>
        </table>

        ${isApproved 
          ? '<p style="color: #059669; font-weight: 600;">Your leave balance has been updated accordingly. Enjoy your time off!</p>'
          : '<p style="color: #64748b;">Your leave balance remains untouched. Please contact your manager if you have questions.</p>'
        }
      </div>
      <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #94a3b8; text-align: center;">
        Automated notification from LeaveEase Employee Leave Management System
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"LeaveEase Notifications" <${process.env.EMAIL_USER}>`,
      to: employeeEmail,
      subject,
      html,
    });
    console.log(`✅ [Nodemailer] Leave status decision email sent to: ${employeeEmail} (Message ID: ${info.messageId})`);
  } catch (err) {
    console.error(`❌ [Nodemailer] Email send error: ${err.message}`);
  }
};
