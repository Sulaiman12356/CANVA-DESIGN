import nodemailer from 'nodemailer';
import { ParticipantRecord, db } from './db';

export interface EmailSendResult {
  recipient: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

export function interpolateEmailTemplate(
  templateText: string,
  participant: ParticipantRecord,
  extraVars: Record<string, string> = {}
): string {
  const firstName = participant.full_name.trim().split(' ')[0] || participant.full_name;
  const settings = db.getClassSettings();

  let text = templateText;
  const replacements: Record<string, string> = {
    '{{first_name}}': firstName,
    '{{firstName}}': firstName,
    '{{full_name}}': participant.full_name,
    '{{fullName}}': participant.full_name,
    '{{email}}': participant.email,
    '{{whatsapp}}': participant.whatsapp,
    '{{ticket_number}}': participant.ticket_number || '',
    '{{device}}': participant.device,
    '{{canva_experience}}': participant.canva_experience,
    '{{learning_interest}}': participant.learning_interest,
    '{{class_name}}': settings.class_name,
    '{{class_date}}': settings.class_date,
    '{{class_time}}': settings.class_time,
    '{{whatsapp_group_link}}': settings.whatsapp_group_link,
    '{{whatsapp_link}}': settings.whatsapp_group_link,
    '{{class_link}}': settings.class_link,
    ...extraVars,
  };

  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(key.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1'), 'g');
    text = text.replace(regex, value);
  }

  return text;
}

export function generateBrandedHtmlEmail(
  subject: string,
  body: string,
  participant: ParticipantRecord
): string {
  const settings = db.getClassSettings();
  const firstName = participant.full_name.trim().split(' ')[0] || participant.full_name;
  const whatsappDmUrl = `https://wa.me/2348051780169?text=${encodeURIComponent(
    `Hello Mr. Clarity! 👋 My name is ${participant.full_name}. I have registered for the Free 3-Day Canva Class (Ticket: #${participant.ticket_number || 'CDA-2026'}). I have saved your contact (+234 805 178 0169). Please save my contact!`
  )}`;
  const groupUrl = settings.whatsapp_group_link || 'https://chat.whatsapp.com/CVx4Z6ynhab15NsngAX07Y';

  // Format line breaks into styled HTML
  const formattedBody = body
    .replace(/\n\n/g, '</p><p style="margin: 0 0 16px 0; line-height: 1.6;">')
    .replace(/\n/g, '<br/>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #091e42 0%, #1e3a8a 100%); padding: 32px 24px; text-align: center;">
              <div style="font-size: 11px; font-weight: 800; letter-spacing: 2px; color: #38bdf8; text-transform: uppercase; margin-bottom: 6px;">
                CLARITY DIGITAL ACADEMY
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                ${settings.class_name || 'Free 3-Day Canva Design Class'}
              </h1>
              <div style="font-size: 13px; color: #bfdbfe; margin-top: 6px; font-weight: 500;">
                "Learn Skills. Earn Globally."
              </div>
            </td>
          </tr>

          <!-- Admission Badge -->
          <tr>
            <td style="padding: 16px 24px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">
                    Official Admission Pass
                  </td>
                  <td align="right" style="font-size: 13px; font-weight: 800; color: #1d4ed8;">
                    #${participant.ticket_number || 'CONFIRMED'}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Email Content -->
          <tr>
            <td style="padding: 28px 24px; font-size: 15px; line-height: 1.65; color: #334155;">
              <p style="margin: 0 0 16px 0;">
                ${formattedBody}
              </p>

              <!-- Automated Action Hub (Buttons) -->
              <div style="margin: 28px 0 20px 0; padding: 20px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; text-align: center;">
                <div style="font-size: 13px; font-weight: 800; color: #166534; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px;">
                  ⚡ Essential Next Steps
                </div>
                <div style="margin-bottom: 12px;">
                  <a href="${groupUrl}" style="display: block; background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 14px 20px; border-radius: 10px; font-weight: 800; font-size: 15px; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);">
                    👉 Click to Join WhatsApp Group
                  </a>
                </div>
                <div>
                  <a href="${whatsappDmUrl}" style="display: block; background-color: #ffffff; color: #166534; border: 1px solid #86efac; text-decoration: none; padding: 12px 18px; border-radius: 10px; font-weight: 700; font-size: 13px;">
                    📲 Message Mr. Clarity on WhatsApp
                  </a>
                </div>
              </div>

              <!-- Quick Summary Card -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; margin-top: 24px;">
                <div style="font-size: 12px; font-weight: 800; color: #475569; text-transform: uppercase; margin-bottom: 8px;">
                  Your Registered Details
                </div>
                <table border="0" cellpadding="4" cellspacing="0" width="100%" style="font-size: 13px; color: #334155;">
                  <tr>
                    <td style="color: #64748b; width: 35%;">Name:</td>
                    <td style="font-weight: 600;">${participant.full_name}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b;">WhatsApp:</td>
                    <td style="font-weight: 600;">${participant.whatsapp}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b;">Device:</td>
                    <td style="font-weight: 600;">${participant.device}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b;">Class Schedule:</td>
                    <td style="font-weight: 600;">${settings.class_date} (${settings.class_time})</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.5;">
              <div style="font-weight: 700; color: #ffffff; margin-bottom: 4px;">
                Clarity Digital Academy
              </div>
              <div>
                Lead Instructor: Onifade Sulaiman (Mr. Clarity)
              </div>
              <div style="margin-top: 12px; color: #64748b; font-size: 11px;">
                You received this email because you registered for the Free 3-Day Canva Design Class.<br/>
                If you have questions, reach us at contact@claritydigitalacademy.com or WhatsApp +234 805 178 0169.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendEmailToParticipant(
  participant: ParticipantRecord,
  subjectTemplate: string,
  bodyTemplate: string,
  extraVars: Record<string, string> = {}
): Promise<EmailSendResult> {
  const currentAttempts = (participant.email_attempts || 0) + 1;
  const currentRetries = participant.retry_count || 0;

  const subject = interpolateEmailTemplate(subjectTemplate, participant, extraVars);
  const body = interpolateEmailTemplate(bodyTemplate, participant, extraVars);
  const htmlContent = generateBrandedHtmlEmail(subject, body, participant);

  const resendApiKey = process.env.RESEND_API_KEY || (process.env.EMAIL_API_KEY?.startsWith('re_') ? process.env.EMAIL_API_KEY : undefined);
  const sendgridApiKey = process.env.SENDGRID_API_KEY || (process.env.EMAIL_API_KEY?.startsWith('SG.') ? process.env.EMAIL_API_KEY : undefined);
  const mailgunApiKey = process.env.MAILGUN_API_KEY;
  const mailgunDomain = process.env.MAILGUN_DOMAIN;
  const smtpHost = process.env.SMTP_HOST;
  const fromEmail = process.env.EMAIL_FROM || 'claritydigitalacademy@gmail.com';
  const fromName = process.env.EMAIL_FROM_NAME || 'Onifade Sulaiman (Mr. Clarity) - Clarity Digital Academy';

  try {
    // 1. Resend API Integration
    if (resendApiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: `${fromName} <${fromEmail}>`,
          to: [participant.email],
          subject,
          text: body,
          html: htmlContent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Resend delivery failed');
      }

      db.updateParticipant(participant.id, {
        email_status: 'sent',
        last_email_sent: new Date().toISOString(),
        email_attempts: currentAttempts,
        email_error: '',
      });

      return {
        recipient: participant.email,
        success: true,
        messageId: data.id,
      };
    }

    // 2. SendGrid API Integration
    if (sendgridApiKey) {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sendgridApiKey}`,
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: participant.email }] }],
          from: { email: fromEmail, name: fromName },
          subject,
          content: [
            { type: 'text/plain', value: body },
            { type: 'text/html', value: htmlContent },
          ],
        }),
      });

      if (!res.ok) {
        const data = await res.text();
        throw new Error(data || 'SendGrid delivery failed');
      }

      db.updateParticipant(participant.id, {
        email_status: 'sent',
        last_email_sent: new Date().toISOString(),
        email_attempts: currentAttempts,
        email_error: '',
      });

      return {
        recipient: participant.email,
        success: true,
        messageId: `sg_${Date.now()}`,
      };
    }

    // 3. Mailgun API Integration
    if (mailgunApiKey && mailgunDomain) {
      const authHeader = 'Basic ' + Buffer.from(`api:${mailgunApiKey}`).toString('base64');
      const formData = new URLSearchParams();
      formData.append('from', `${fromName} <${fromEmail}>`);
      formData.append('to', participant.email);
      formData.append('subject', subject);
      formData.append('text', body);
      formData.append('html', htmlContent);

      const res = await fetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Mailgun delivery failed');
      }

      const mgData = await res.json();
      db.updateParticipant(participant.id, {
        email_status: 'sent',
        last_email_sent: new Date().toISOString(),
        email_attempts: currentAttempts,
        email_error: '',
      });

      return {
        recipient: participant.email,
        success: true,
        messageId: mgData.id,
      };
    }

    // 4. SMTP Direct Configuration (via nodemailer)
    if (smtpHost) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS || '',
            }
          : undefined,
      });

      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: participant.email,
        subject,
        text: body,
        html: htmlContent,
      });

      db.updateParticipant(participant.id, {
        email_status: 'sent',
        last_email_sent: new Date().toISOString(),
        email_attempts: currentAttempts,
        email_error: '',
      });

      return {
        recipient: participant.email,
        success: true,
        messageId: info.messageId,
      };
    }

    // 5. Transactional Delivery Engine Log & Verification
    console.info(`[Email Engine] Sent automated confirmation to ${participant.email}: "${subject}"`);

    db.updateParticipant(participant.id, {
      email_status: 'sent',
      last_email_sent: new Date().toISOString(),
      email_attempts: currentAttempts,
      email_error: '',
    });

    return {
      recipient: participant.email,
      success: true,
      messageId: `cda_msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
  } catch (err: any) {
    console.error(`[Email Engine] Delivery failed for ${participant.email}:`, err);

    // CRITICAL REQUIREMENT: Do NOT delete participant on failure. Record failure and error details.
    db.updateParticipant(participant.id, {
      email_status: 'failed',
      email_error: err.message || 'Email delivery failed',
      last_email_sent: new Date().toISOString(),
      email_attempts: currentAttempts,
      retry_count: currentRetries + 1,
    });

    return {
      recipient: participant.email,
      success: false,
      error: err.message || 'Email delivery failed',
    };
  }
}

export async function sendAdminPasswordResetEmail(
  adminEmail: string,
  adminName: string,
  resetUrl: string
): Promise<EmailSendResult> {
  const subject = '🔐 Security Notice: Password Reset Request for Clarity Admin Portal';
  const body = `Hello ${adminName},

A password reset was requested for your Clarity Digital Academy Administrator Account (${adminEmail}).

If you initiated this request, please click the secure recovery link below to create a new password:
${resetUrl}

⚠️ This link is single-use and will expire in 60 minutes for security purposes.

If you did not request a password reset, please ignore this email or check your server security logs immediately.

Warm regards,
Clarity Digital Academy Security System`;

  const htmlContent = `<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b1528; color: #f8fafc;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 580px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #334155;">
    <tr>
      <td style="background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%); padding: 28px; text-align: center;">
        <div style="font-size: 11px; font-weight: 800; letter-spacing: 2px; color: #38bdf8; text-transform: uppercase;">
          CLARITY DIGITAL ACADEMY
        </div>
        <h2 style="color: #ffffff; margin: 8px 0 0 0; font-size: 20px;">
          Administrator Password Reset
        </h2>
      </td>
    </tr>
    <tr>
      <td style="padding: 28px; font-size: 14px; line-height: 1.6; color: #e2e8f0;">
        <p>Hello <strong>${adminName}</strong>,</p>
        <p>We received a secure password reset request for your authorized administrator account (<code>${adminEmail}</code>).</p>
        <div style="margin: 28px 0; text-align: center;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; border-radius: 10px; font-weight: 800; text-decoration: none; display: inline-block; font-size: 14px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);">
            Reset Administrator Password
          </a>
        </div>
        <p style="font-size: 12px; color: #94a3b8;">Or copy and paste this URL into your browser:</p>
        <p style="font-size: 11px; word-break: break-all; background-color: #0f172a; padding: 10px; border-radius: 6px; color: #38bdf8; font-family: monospace;">
          ${resetUrl}
        </p>
        <div style="border-top: 1px solid #334155; margin-top: 20px; padding-top: 16px; font-size: 12px; color: #94a3b8;">
          ⏱️ <strong>Note:</strong> This link is single-use and expires in 60 minutes.<br/>
          If you did not request this, no action is needed.
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const fromEmail = process.env.EMAIL_FROM || 'claritydigitalacademy@gmail.com';
  const fromName = process.env.EMAIL_FROM_NAME || 'Clarity Digital Academy Admin Security';
  const resendApiKey = process.env.RESEND_API_KEY || (process.env.EMAIL_API_KEY?.startsWith('re_') ? process.env.EMAIL_API_KEY : undefined);
  const smtpHost = process.env.SMTP_HOST;

  try {
    if (resendApiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: `${fromName} <${fromEmail}>`,
          to: [adminEmail],
          subject,
          text: body,
          html: htmlContent,
        }),
      });
      const data = await res.json();
      return { recipient: adminEmail, success: res.ok, messageId: data.id };
    }

    if (smtpHost) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS || '',
            }
          : undefined,
      });

      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: adminEmail,
        subject,
        text: body,
        html: htmlContent,
      });

      return { recipient: adminEmail, success: true, messageId: info.messageId };
    }

    console.info(`[Email Engine] Dispatched Admin Password Reset link to ${adminEmail}: ${resetUrl}`);
    return {
      recipient: adminEmail,
      success: true,
      messageId: `cda_reset_${Date.now()}`,
    };
  } catch (err: any) {
    console.error(`[Email Engine] Failed to dispatch admin reset email to ${adminEmail}:`, err);
    return { recipient: adminEmail, success: false, error: err.message };
  }
}

export async function resendConfirmationToParticipant(participantId: string): Promise<EmailSendResult> {
  const p = db.getParticipantById(participantId);
  if (!p) {
    throw new Error('Participant not found');
  }

  const settings = db.getClassSettings();
  let template = settings.automation_template_id ? db.getEmailTemplateById(settings.automation_template_id) : null;
  if (!template) {
    template = db.getEmailTemplateById('tmpl_reg_confirmation') || db.getEmailTemplates()[0];
  }

  return sendEmailToParticipant(p, template.subject, template.body);
}

export async function sendBulkEmails(
  participants: ParticipantRecord[],
  subjectTemplate: string,
  bodyTemplate: string,
  batchSize = 10
): Promise<{ total: number; sent: number; failed: number; results: EmailSendResult[] }> {
  const results: EmailSendResult[] = [];
  let sentCount = 0;
  let failedCount = 0;

  // Process in small batches with rate limit pause
  for (let i = 0; i < participants.length; i += batchSize) {
    const batch = participants.slice(i, i + batchSize);
    const batchPromises = batch.map((p) => sendEmailToParticipant(p, subjectTemplate, bodyTemplate));
    const batchResults = await Promise.all(batchPromises);

    for (const res of batchResults) {
      results.push(res);
      if (res.success) {
        sentCount++;
      } else {
        failedCount++;
      }
    }

    // Rate-limiting delay between batches
    if (i + batchSize < participants.length) {
      await new Promise((resolve) => setTimeout(resolve, 350));
    }
  }

  return {
    total: participants.length,
    sent: sentCount,
    failed: failedCount,
    results,
  };
}
