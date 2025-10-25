import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { serverClient } from "../_shared/client.ts";
import { json } from "../_shared/json.ts";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { validateRequestBody } from '../_shared/inputValidation.ts';
import { mapError } from '../_shared/errorMapping.ts';

const verifySchema = z.object({
  verificationId: z.string().uuid(),
  approved: z.boolean(),
  notes: z.string().max(1000).optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = serverClient(req);

  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return json({ error: "Unauthorized" }, 401);
    }

    // Check if user is admin
    const { data: roles, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (roleError || !roles) {
      return json({ error: "Admin access required" }, 403);
    }

    const { verificationId, approved, notes } = await validateRequestBody(req, verifySchema);

    // Get verification details
    const { data: verification, error: verificationError } = await supabase
      .from("professional_verifications")
      .select("professional_id")
      .eq("id", verificationId)
      .single();

    if (verificationError || !verification) {
      return json({ error: "Verification not found" }, 404);
    }

    const professionalId = verification.professional_id;

    // Get professional profile and user details
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", professionalId)
      .single();

    if (profileError || !profile) {
      return json({ error: "Professional profile not found" }, 404);
    }

    const professionalName = profile.full_name;
    const professionalEmail = profile.email;

    // Update verification status
    const { error: updateError } = await supabase
      .from("professional_verifications")
      .update({
        status: approved ? "approved" : "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        notes: notes || null,
      })
      .eq("id", verificationId);

    if (updateError) {
      console.error("Failed to update verification:", updateError);
      return json({ error: "Failed to update verification" }, 500);
    }

    // If approved, update professional_profiles
    if (approved) {
      const { error: profileError } = await supabase
        .from("professional_profiles")
        .update({
          verified: true,
          kyc_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        })
        .eq("user_id", professionalId);

      if (profileError) {
        console.error("Failed to update professional profile:", profileError);
      }
    }

    // Log admin action
    const { error: auditError } = await supabase
      .from("admin_audit_logs")
      .insert({
        admin_id: user.id,
        action: approved ? "verification_approved" : "verification_rejected",
        entity_type: "professional_verification",
        entity_id: verificationId,
        details: {
          professional_id: professionalId,
          professional_name: professionalName,
          notes: notes,
        },
      });

    if (auditError) {
      console.error("Failed to log admin action:", auditError);
    }

    // Send notification email
    try {
      await supabase.functions.invoke("send-email", {
        body: {
          type: approved ? "verification_approved" : "verification_rejected",
          data: {
            email: professionalEmail,
            name: professionalName,
            reason: notes,
          },
        },
      });
    } catch (emailError) {
      console.error("Failed to send notification email:", emailError);
      // Don't fail the request if email fails
    }

    console.log(`Verification ${approved ? "approved" : "rejected"}: ${verificationId} by admin ${user.id}`);

    return json({
      success: true,
      verificationId,
      approved,
    });

  } catch (error) {
    console.error("Admin verify error:", error);
    return json({ error: mapError(error) }, 500);
  }
});
