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

function getEmailTemplate(type: string, data: any): EmailTemplate {
  const templates: Record<string, EmailTemplate> = {
    verification_approved: {
      to: data.email,
      subject: "Verification Approved - You're Ready to Receive Jobs!",
      html: `
        <h1>Congratulations ${data.name}!</h1>
        <p>Your professional verification has been approved.</p>
        <p>You can now start receiving job opportunities on our platform.</p>
        <p><strong>Next steps:</strong></p>
        <ul>
          <li>Complete your profile</li>
          <li>Add your services</li>
          <li>Start receiving job requests</li>
        </ul>
        <p>Best regards,<br>The Team</p>
      `,
    },
    verification_rejected: {
      to: data.email,
      subject: "Verification Update Required",
      html: `
        <h1>Hello ${data.name}</h1>
        <p>We need additional information to complete your verification.</p>
        <p><strong>Reason:</strong> ${data.reason}</p>
        <p>Please update your documents and resubmit for verification.</p>
        <p>If you have questions, please contact our support team.</p>
        <p>Best regards,<br>The Team</p>
      `,
    },
    admin_notification: {
      to: data.adminEmail,
      subject: `New Verification Request from ${data.professionalName}`,
      html: `
        <h1>New Verification Request</h1>
        <p><strong>Professional:</strong> ${data.professionalName}</p>
        <p><strong>Email:</strong> ${data.professionalEmail}</p>
        <p><strong>Verification Type:</strong> ${data.verificationType}</p>
        <p><strong>Submitted:</strong> ${new Date(data.submittedAt).toLocaleString()}</p>
        <p>Please review this verification request in the admin panel.</p>
      `,
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
