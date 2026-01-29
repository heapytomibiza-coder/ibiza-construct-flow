import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getErrorMessage } from '../_shared/errorUtils.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-PAYMENT-REMINDER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    logStep("Fetching payments needing reminders");
    
    // Get payments needing reminders
    const { data: paymentsNeedingReminders, error: paymentsError } = await supabaseAdmin
      .rpc('get_payments_needing_reminders');

    if (paymentsError) {
      logStep("Error fetching payments", { error: paymentsError });
      throw paymentsError;
    }

    logStep("Payments found", { count: paymentsNeedingReminders?.length || 0 });

    if (!paymentsNeedingReminders || paymentsNeedingReminders.length === 0) {
      return new Response(
        JSON.stringify({ message: "No reminders to send", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    let successCount = 0;
    let failCount = 0;

    // Send reminders for each payment
    for (const payment of paymentsNeedingReminders) {
      try {
        // Get user details
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(payment.user_id);
        
        if (userError || !userData.user?.email) {
          logStep("User not found or no email", { userId: payment.user_id });
          failCount++;
          continue;
        }

        const userEmail = userData.user.email;

        // Get user notification preferences
        const { data: prefs } = await supabaseAdmin
          .from('notification_preferences')
          .select('*')
          .eq('user_id', payment.user_id)
          .single();

        // Check if email notifications are enabled
        if (prefs && !prefs.email_enabled) {
          logStep("Email notifications disabled for user", { userId: payment.user_id });
          continue;
        }

        // Get job details
        const { data: jobData } = await supabaseAdmin
          .from('jobs')
          .select('title')
          .eq('id', payment.job_id)
          .single();

        const jobTitle = jobData?.title || 'Your job';

        // Format due date
        const dueDate = new Date(payment.due_date);
        const formattedDate = dueDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        // Send email via Resend
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Ibiza Construct <payments@ibiza.app>',
            to: userEmail,
            subject: `Payment Reminder: Installment #${payment.installment_number} Due Soon`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Payment Reminder</h2>
                <p>Hello,</p>
                <p>This is a friendly reminder that you have an upcoming payment due for <strong>${jobTitle}</strong>.</p>
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #555;">Payment Details</h3>
                  <p><strong>Installment Number:</strong> ${payment.installment_number}</p>
                  <p><strong>Amount:</strong> ${payment.currency} ${payment.amount}</p>
                  <p><strong>Due Date:</strong> ${formattedDate}</p>
                </div>
                <p>Please ensure you have sufficient funds available to complete this payment on time.</p>
                <p>If you have any questions or concerns, please don't hesitate to contact us.</p>
                <p>Best regards,<br>Your Payment Team</p>
              </div>
            `,
          }),
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          logStep("Failed to send email", { error: errorText, userId: payment.user_id });
          failCount++;
          
          // Log failed reminder
          await supabaseAdmin.from('payment_reminders').insert({
            scheduled_payment_id: payment.payment_id,
            user_id: payment.user_id,
            reminder_type: 'upcoming',
            channel: 'email',
            status: 'failed',
            metadata: { error: errorText }
          });
          
          continue;
        }

        logStep("Email sent successfully", { userId: payment.user_id, paymentId: payment.payment_id });

        // Log successful reminder
        await supabaseAdmin.from('payment_reminders').insert({
          scheduled_payment_id: payment.payment_id,
          user_id: payment.user_id,
          reminder_type: 'upcoming',
          channel: 'email',
          status: 'sent',
          metadata: { 
            amount: payment.amount,
            currency: payment.currency,
            due_date: payment.due_date,
            installment_number: payment.installment_number
          }
        });

        successCount++;
      } catch (error) {
        logStep("Error processing payment reminder", { error: getErrorMessage(error), paymentId: payment.payment_id });
        failCount++;
      }
    }

    logStep("Reminder processing complete", { successCount, failCount });

    return new Response(
      JSON.stringify({ 
        message: "Payment reminders processed",
        total: paymentsNeedingReminders.length,
        sent: successCount,
        failed: failCount
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
