import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Not authenticated");
    }

    const { milestoneId, notes, review, override = false } = await req.json();
    console.log("[release-escrow] Request:", { milestoneId, userId: user.id, hasReview: !!review, override });

    if (!milestoneId) {
      throw new Error("Missing milestoneId");
    }

    // Get milestone details
    const { data: milestone, error: milestoneError } = await supabase
      .from("escrow_milestones")
      .select(`
        *,
        payment:payments!payment_id (
          id,
          client_id,
          professional_id,
          net_amount,
          job_id
        )
      `)
      .eq("id", milestoneId)
      .single();

    if (milestoneError || !milestone) {
      throw new Error("Milestone not found");
    }

    // Verify user is the client
    if (milestone.payment.client_id !== user.id) {
      throw new Error("Unauthorized: Only the client can release escrow");
    }

    // Verify milestone is pending
    if (milestone.status !== "pending") {
      throw new Error(`Cannot release milestone with status: ${milestone.status}`);
    }

    // Admin override path
    if (override === true) {
      const { data: isAdmin } = await supabase.rpc('has_role', {
        p_user: user.id,
        p_role: 'admin'
      });
      
      if (!isAdmin) {
        throw new Error("Unauthorized: Admin override requires admin role");
      }
      
      console.log("[release-escrow] Admin override activated by:", user.id);
      
      // Create override audit record
      await supabase.from('escrow_release_overrides').insert({
        milestone_id: milestoneId,
        admin_id: user.id,
        reason: notes || 'Admin override - no review required'
      });
    }
    
    // Non-admin path: require review
    if (!override) {
      // Check if review already exists
      const { data: existingReview } = await supabase
        .from('professional_reviews')
        .select('id')
        .eq('client_id', user.id)
        .eq('milestone_id', milestoneId)
        .maybeSingle();
      
      if (!existingReview) {
        // No existing review - one must be provided
        if (!review || !review.rating) {
          throw new Error("Review required: Please rate the work before releasing funds");
        }
        
        // Validate rating
        if (review.rating < 1 || review.rating > 5) {
          throw new Error("Invalid rating: Must be between 1 and 5");
        }
        
        // Insert review atomically
        const { error: reviewError } = await supabase
          .from('professional_reviews')
          .insert({
            professional_id: milestone.payment.professional_id,
            client_id: user.id,
            job_id: milestone.payment.job_id,
            contract_id: milestone.payment.contract_id || null,
            milestone_id: milestoneId,
            rating: review.rating,
            title: review.title || null,
            comment: review.comment || null,
            is_verified: true
          });
        
        if (reviewError) {
          console.error("[release-escrow] Review insert error:", reviewError);
          throw new Error("Failed to save review: " + reviewError.message);
        }
        
        console.log("[release-escrow] Review saved for milestone:", milestoneId);
      }
    }

    console.log("[release-escrow] Releasing milestone:", milestone.id);

    // Update milestone status
    const { error: updateError } = await supabase
      .from("escrow_milestones")
      .update({
        status: "completed",
        completed_date: new Date().toISOString(),
        released_by: user.id,
        released_at: new Date().toISOString(),
      })
      .eq("id", milestoneId);

    if (updateError) {
      console.error("[release-escrow] Update error:", updateError);
      throw updateError;
    }

    // Create escrow release record
    const { error: releaseError } = await supabase
      .from("escrow_releases")
      .insert({
        milestone_id: milestoneId,
        payment_id: milestone.payment_id,
        amount: milestone.amount,
        status: "released",
        released_by: user.id,
        released_at: new Date().toISOString(),
        notes,
      });

    if (releaseError) {
      console.error("[release-escrow] Release record error:", releaseError);
      throw releaseError;
    }

    // Check if professional has a payout pending
    const { data: pendingPayout } = await supabase
      .from("payouts")
      .select("id")
      .eq("professional_id", milestone.payment.professional_id)
      .eq("status", "pending")
      .single();

    if (pendingPayout) {
      // Add to existing payout
      await supabase.from("payout_items").insert({
        payout_id: pendingPayout.id,
        payment_id: milestone.payment_id,
        amount: milestone.amount,
      });

      // Update payout amount
      const { data: payout } = await supabase
        .from("payouts")
        .select("amount")
        .eq("id", pendingPayout.id)
        .single();

      await supabase
        .from("payouts")
        .update({
          amount: (payout?.amount || 0) + milestone.amount,
        })
        .eq("id", pendingPayout.id);

      console.log("[release-escrow] Added to existing payout:", pendingPayout.id);
    } else {
      // Create new payout
      const { data: newPayout } = await supabase
        .from("payouts")
        .insert({
          professional_id: milestone.payment.professional_id,
          amount: milestone.amount,
          currency: "USD",
          status: "pending",
        })
        .select()
        .single();

      if (newPayout) {
        await supabase.from("payout_items").insert({
          payout_id: newPayout.id,
          payment_id: milestone.payment_id,
          amount: milestone.amount,
        });
        console.log("[release-escrow] Created new payout:", newPayout.id);
      }
    }

    // Create activity notifications
    await supabase.from("activity_feed").insert([
      {
        user_id: milestone.payment.client_id,
        event_type: "escrow_released",
        entity_type: "milestone",
        entity_id: milestoneId,
        title: "Escrow Released",
        description: `You released ${milestone.amount} to the professional`,
        action_url: `/jobs/${milestone.payment.job_id}`,
      },
      {
        user_id: milestone.payment.professional_id,
        event_type: "funds_released",
        entity_type: "milestone",
        entity_id: milestoneId,
        title: "Funds Released",
        description: `Client released ${milestone.amount} from escrow`,
        action_url: `/jobs/${milestone.payment.job_id}`,
      },
    ]);

    console.log("[release-escrow] Successfully released escrow");

    return new Response(
      JSON.stringify({
        success: true,
        message: override 
          ? "Escrow released (admin override)" 
          : "Funds released. Thanks for your review!",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[release-escrow] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
