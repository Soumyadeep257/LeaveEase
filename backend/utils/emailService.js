import nodemailer from 'nodemailer';

/**
 * Configure Nodemailer transporter.
 * If credentials are provided in .env, connects to SMTP.
 * Otherwise falls back to mock console logging.
 */
const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (user && pass && user.trim() !== '' && pass.trim() !== '') {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: { user, pass },
    });
  }

  return null;
};

/**
 * Send email when an employee applies for a leave (notifies managers).
 */
export const sendLeaveAppliedEmail = async ({ managerEmails, employeeName, department, leaveType, startDate, endDate, totalDays, reason }) => {
  const transporter = createTransporter();

  const subject = `[LeaveEase] New Leave Application: ${employeeName} (${department})`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 16px 20px; border-radius: 8px; color: white;">
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

        <p>Please log in to the <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/manager/dashboard" style="color: #4f46e5; font-weight: bold;">Manager Portal</a> to review, evaluate department scheduling, and approve or reject this request.</p>
      </div>
      <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #94a3b8; text-align: center;">
        Automated notification from LeaveEase Employee Leave Management System
      </div>
    </div>
  `;

  if (transporter && managerEmails && managerEmails.length > 0) {
    try {
      await transporter.sendMail({
        from: `"LeaveEase Portal" <${process.env.EMAIL_USER}>`,
        to: managerEmails.join(', '),
        subject,
        html,
      });
      console.log(`📧 [Nodemailer] Leave application alert sent to: ${managerEmails.join(', ')}`);
    } catch (err) {
      console.error(`⚠️  [Nodemailer] Could not send email: ${err.message}`);
    }
  } else {
    console.log(`📧 [Email Simulation] New leave application from ${employeeName} (${totalDays} day(s) ${leaveType}). Set EMAIL_USER & EMAIL_PASS in .env to send real emails.`);
  }
};

/**
 * Send email when a manager approves or rejects a leave request (notifies the employee).
 */
export const sendLeaveStatusEmail = async ({ employeeEmail, employeeName, leaveType, startDate, endDate, totalDays, status, managerComment }) => {
  const transporter = createTransporter();
  const isApproved = status === 'Approved';

  const subject = `[LeaveEase] Leave Request ${status}: ${totalDays} day(s) of ${leaveType} leave`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="background: ${isApproved ? '#059669' : '#dc2626'}; padding: 16px 20px; border-radius: 8px; color: white;">
        <h2 style="margin: 0; font-size: 20px;">LeaveEase - Leave Request ${status}</h2>
      </div>
      <div style="padding: 20px 0; color: #1e293b;">
        <p>Hello ${employeeName},</p>
        <p>Your leave request has been reviewed by your manager and marked as <strong style="color: ${isApproved ? '#059669' : '#dc2626'};">${status}</strong>.</p>
        
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
            <td style="padding: 10px 14px; font-style: italic; color: #334155;">${managerComment || 'No additional remarks.'}</td>
          </tr>
        </table>

        ${isApproved 
          ? '<p style="color: #059669; font-weight: 500;">Your leave balance has been updated accordingly. Have a wonderful time off!</p>'
          : '<p style="color: #64748b;">Your leave balance remains untouched. Please contact your manager if you have questions.</p>'
        }
      </div>
      <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #94a3b8; text-align: center;">
        Automated notification from LeaveEase Employee Leave Management System
      </div>
    </div>
  `;

  if (transporter && employeeEmail) {
    try {
      await transporter.sendMail({
        from: `"LeaveEase Portal" <${process.env.EMAIL_USER}>`,
        to: employeeEmail,
        subject,
        html,
      });
      console.log(`📧 [Nodemailer] Status decision sent to employee: ${employeeEmail}`);
    } catch (err) {
      console.error(`⚠️  [Nodemailer] Could not send email: ${err.message}`);
    }
  } else {
    console.log(`📧 [Email Simulation] Leave ${status} email to ${employeeEmail} (${status}). Set EMAIL_USER & EMAIL_PASS in .env to send real emails.`);
  }
};
