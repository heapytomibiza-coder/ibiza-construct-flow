import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { json } from "../_shared/json.ts";
import { getErrorMessage } from '../_shared/errorUtils.ts';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
}

const brandColors = {
  primary: '#D4A574',
  secondary: '#8B7355',
  background: '#FAF8F5',
  text: '#2C2C2C',
};

const emailHeader = `
  <div style="background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%); padding: 40px 20px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      Constructive Solutions Ibiza
    </h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Building Excellence in the Mediterranean</p>
  </div>
`;

const emailFooter = `
  <div style="background-color: #f5f5f5; padding: 30px 20px; margin-top: 40px; text-align: center; border-top: 3px solid ${brandColors.primary};">
    <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">
      <strong>Constructive Solutions Ibiza</strong><br>
      Professional Construction Services in Ibiza
    </p>
    <p style="color: #999; font-size: 12px; margin: 0;">
      This is an automated message, please do not reply directly to this email.
    </p>
  </div>
`;

const wrapEmailContent = (content: string) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        ${emailHeader}
        <div style="padding: 40px 30px;">
          ${content}
        </div>
        ${emailFooter}
      </div>
    </body>
  </html>
`;

function getEmailTemplate(type: string, data: any): EmailTemplate {
  const templates: Record<string, EmailTemplate> = {
    welcome: {
      to: data.email,
      subject: "Welcome to Constructive Solutions Ibiza!",
      html: wrapEmailContent(`
        <h2 style="color: ${brandColors.text}; margin-top: 0;">Welcome, ${data.name}! 🎉</h2>
        <p style="color: #555; line-height: 1.6; font-size: 16px;">
          We're thrilled to have you join Constructive Solutions Ibiza, your trusted platform for professional construction services in the Mediterranean.
        </p>
        <div style="background-color: ${brandColors.background}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${brandColors.primary};">
          <h3 style="color: ${brandColors.secondary}; margin-top: 0;">Get Started:</h3>
          <ul style="color: #555; line-height: 1.8;">
            <li>Complete your profile to showcase your expertise</li>
            <li>Browse available projects or post your requirements</li>
            <li>Connect with verified professionals</li>
            <li>Experience secure payments and contracts</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            Go to Dashboard
          </a>
        </div>
        <p style="color: #777; font-size: 14px; margin-top: 30px;">
          Need help? Our support team is here for you. Simply reply to this email or visit our help center.
        </p>
      `),
    },
    verification_approved: {
      to: data.email,
      subject: "✓ Verification Approved - Start Receiving Projects!",
      html: wrapEmailContent(`
        <div style="text-align: center; padding: 20px 0;">
          <div style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; border-radius: 50px; font-size: 18px; font-weight: 600;">
            ✓ Verified Professional
          </div>
        </div>
        <h2 style="color: ${brandColors.text}; text-align: center;">Congratulations, ${data.name}!</h2>
        <p style="color: #555; line-height: 1.6; font-size: 16px; text-align: center;">
          Your professional verification has been approved. You're now a trusted member of our community.
        </p>
        <div style="background-color: ${brandColors.background}; padding: 25px; border-radius: 8px; margin: 30px 0;">
          <h3 style="color: ${brandColors.secondary}; margin-top: 0;">You Can Now:</h3>
          <ul style="color: #555; line-height: 1.8; font-size: 15px;">
            <li>✓ Receive project requests from clients</li>
            <li>✓ Submit quotes and proposals</li>
            <li>✓ Build your professional reputation</li>
            <li>✓ Access secure payment processing</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            View Available Projects
          </a>
        </div>
      `),
    },
    verification_rejected: {
      to: data.email,
      subject: "Verification Update Required",
      html: wrapEmailContent(`
        <h2 style="color: ${brandColors.text};">Hello ${data.name},</h2>
        <p style="color: #555; line-height: 1.6; font-size: 16px;">
          We need additional information to complete your verification process.
        </p>
        <div style="background-color: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
          <h3 style="color: #DC2626; margin-top: 0;">Reason:</h3>
          <p style="color: #555; margin: 0;">${data.reason}</p>
        </div>
        <p style="color: #555; line-height: 1.6;">
          Please update your documents and resubmit for verification. Our team typically reviews submissions within 24-48 hours.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.resubmitUrl}" style="display: inline-block; background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600;">
            Update Verification
          </a>
        </div>
        <p style="color: #777; font-size: 14px;">
          If you have questions, please contact our support team.
        </p>
      `),
    },
    contract_created: {
      to: data.email,
      subject: `New Contract: ${data.contractTitle}`,
      html: wrapEmailContent(`
        <h2 style="color: ${brandColors.text};">New Contract Created</h2>
        <p style="color: #555; line-height: 1.6; font-size: 16px;">
          Hello ${data.name}, a new contract has been created for your review.
        </p>
        <div style="background-color: ${brandColors.background}; padding: 25px; border-radius: 8px; margin: 25px 0; border: 2px solid ${brandColors.primary};">
          <h3 style="color: ${brandColors.secondary}; margin-top: 0;">Contract Details:</h3>
          <table style="width: 100%; color: #555; font-size: 15px;">
            <tr>
              <td style="padding: 8px 0;"><strong>Title:</strong></td>
              <td style="padding: 8px 0;">${data.contractTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Amount:</strong></td>
              <td style="padding: 8px 0; color: ${brandColors.primary}; font-weight: 600; font-size: 18px;">€${data.amount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>From:</strong></td>
              <td style="padding: 8px 0;">${data.fromName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Created:</strong></td>
              <td style="padding: 8px 0;">${new Date(data.createdAt).toLocaleDateString()}</td>
            </tr>
          </table>
        </div>
        <p style="color: #555; line-height: 1.6;">
          Please review the contract terms carefully before signing.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.contractUrl}" style="display: inline-block; background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            Review Contract
          </a>
        </div>
      `),
    },
    contract_signed: {
      to: data.email,
      subject: `✓ Contract Signed: ${data.contractTitle}`,
      html: wrapEmailContent(`
        <div style="text-align: center; padding: 20px 0;">
          <div style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; border-radius: 50px; font-size: 18px; font-weight: 600;">
            ✓ Contract Signed
          </div>
        </div>
        <h2 style="color: ${brandColors.text}; text-align: center;">Contract Successfully Signed</h2>
        <p style="color: #555; line-height: 1.6; font-size: 16px; text-align: center;">
          Hello ${data.name}, the contract has been signed by all parties.
        </p>
        <div style="background-color: ${brandColors.background}; padding: 25px; border-radius: 8px; margin: 25px 0;">
          <h3 style="color: ${brandColors.secondary}; margin-top: 0;">${data.contractTitle}</h3>
          <p style="color: #555; margin: 10px 0;">
            <strong>Contract Amount:</strong> <span style="color: ${brandColors.primary}; font-size: 20px; font-weight: 600;">€${data.amount}</span>
          </p>
          <p style="color: #555; margin: 10px 0;"><strong>Signed By:</strong> ${data.signedBy}</p>
          <p style="color: #555; margin: 10px 0;"><strong>Date:</strong> ${new Date(data.signedAt).toLocaleString()}</p>
        </div>
        <p style="color: #555; line-height: 1.6;">
          Work can now begin! The payment is secured in escrow and will be released upon project completion.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.contractUrl}" style="display: inline-block; background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600;">
            View Contract
          </a>
        </div>
      `),
    },
    payment_confirmation: {
      to: data.email,
      subject: `Payment Confirmed: €${data.amount}`,
      html: wrapEmailContent(`
        <div style="text-align: center; padding: 20px 0;">
          <div style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; border-radius: 50px; font-size: 18px; font-weight: 600;">
            ✓ Payment Confirmed
          </div>
        </div>
        <h2 style="color: ${brandColors.text}; text-align: center;">Payment Successfully Processed</h2>
        <p style="color: #555; line-height: 1.6; font-size: 16px; text-align: center;">
          Hello ${data.name}, your payment has been confirmed and secured.
        </p>
        <div style="background-color: ${brandColors.background}; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center; border: 2px solid ${brandColors.primary};">
          <p style="color: #777; font-size: 14px; margin: 0 0 10px 0;">Payment Amount</p>
          <p style="color: ${brandColors.primary}; font-size: 36px; font-weight: 700; margin: 0;">€${data.amount}</p>
        </div>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: ${brandColors.secondary}; margin-top: 0;">Transaction Details:</h3>
          <table style="width: 100%; color: #555; font-size: 15px;">
            <tr>
              <td style="padding: 8px 0;"><strong>Reference:</strong></td>
              <td style="padding: 8px 0;">${data.transactionId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Project:</strong></td>
              <td style="padding: 8px 0;">${data.projectTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Date:</strong></td>
              <td style="padding: 8px 0;">${new Date(data.paidAt).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Status:</strong></td>
              <td style="padding: 8px 0; color: #10b981; font-weight: 600;">Secured in Escrow</td>
            </tr>
          </table>
        </div>
        <p style="color: #555; line-height: 1.6;">
          Your payment is secure and will be released to the professional upon successful project completion.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.invoiceUrl}" style="display: inline-block; background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600;">
            Download Receipt
          </a>
        </div>
      `),
    },
    payment_received: {
      to: data.email,
      subject: `Payment Received: €${data.amount}`,
      html: wrapEmailContent(`
        <div style="text-align: center; padding: 20px 0;">
          <div style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; border-radius: 50px; font-size: 18px; font-weight: 600;">
            💰 Payment Received
          </div>
        </div>
        <h2 style="color: ${brandColors.text}; text-align: center;">Payment Released to Your Account</h2>
        <p style="color: #555; line-height: 1.6; font-size: 16px; text-align: center;">
          Hello ${data.name}, congratulations! Your payment has been released from escrow.
        </p>
        <div style="background-color: ${brandColors.background}; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center; border: 2px solid ${brandColors.primary};">
          <p style="color: #777; font-size: 14px; margin: 0 0 10px 0;">Amount Received</p>
          <p style="color: ${brandColors.primary}; font-size: 36px; font-weight: 700; margin: 0;">€${data.amount}</p>
        </div>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: ${brandColors.secondary}; margin-top: 0;">Payment Details:</h3>
          <table style="width: 100%; color: #555; font-size: 15px;">
            <tr>
              <td style="padding: 8px 0;"><strong>Project:</strong></td>
              <td style="padding: 8px 0;">${data.projectTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Client:</strong></td>
              <td style="padding: 8px 0;">${data.clientName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Released:</strong></td>
              <td style="padding: 8px 0;">${new Date(data.releasedAt).toLocaleString()}</td>
            </tr>
          </table>
        </div>
        <p style="color: #555; line-height: 1.6;">
          The funds have been transferred to your account and should appear within 1-3 business days.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600;">
            View Dashboard
          </a>
        </div>
      `),
    },
    admin_notification: {
      to: data.adminEmail,
      subject: `Admin: ${data.notificationType} - ${data.subject}`,
      html: wrapEmailContent(`
        <div style="background-color: #FEF2F2; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #DC2626;">
          <h3 style="color: #DC2626; margin: 0; font-size: 14px;">⚠️ ADMIN NOTIFICATION</h3>
        </div>
        <h2 style="color: ${brandColors.text};">${data.subject}</h2>
        <p style="color: #555; line-height: 1.6; font-size: 16px;">
          ${data.message}
        </p>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <pre style="margin: 0; color: #555; font-size: 13px; white-space: pre-wrap; word-wrap: break-word;">${JSON.stringify(data.details, null, 2)}</pre>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.actionUrl}" style="display: inline-block; background: #DC2626; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600;">
            Take Action
          </a>
        </div>
      `),
    },
  };

  return templates[type];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();

    if (!type || !data) {
      return json({ error: "Missing required fields: type, data" }, 400);
    }

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return json({ error: "Email service not configured" }, 500);
    }

    const template = getEmailTemplate(type, data);

    if (!template) {
      return json({ error: `Unknown email template: ${type}` }, 400);
    }

    // Send email via Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Lovable <onboarding@resend.dev>",
        to: template.to,
        subject: template.subject,
        html: template.html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Resend API error:", error);
      return json({ error: "Failed to send email" }, 500);
    }

    const result = await response.json();
    console.log(`Email sent: ${type} to ${template.to}`);

    return json({ success: true, emailId: result.id });

  } catch (error) {
    console.error("Send email error:", error);
    return json({ error: getErrorMessage(error) }, 500);
  }
});
