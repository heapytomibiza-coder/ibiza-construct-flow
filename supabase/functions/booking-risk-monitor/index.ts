import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RiskFlag {
  booking_id: string;
  risk_type: string;
  severity: string;
  message: string;
  metadata?: any;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting booking risk monitor...");

    // Fetch active bookings that need monitoring
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select(`
        id,
        status,
        escrow_funded_at,
        checkin_window_start,
        checkin_window_end,
        auto_complete_eligible_at,
        client_id,
        created_at
      `)
      .in("status", ["pending", "confirmed", "in_progress"]);

    if (bookingsError) throw bookingsError;

    const risksDetected: RiskFlag[] = [];
    const now = new Date();

    for (const booking of bookings || []) {
      // Risk 1: Escrow missing for confirmed bookings
      if (booking.status === "confirmed" && !booking.escrow_funded_at) {
        risksDetected.push({
          booking_id: booking.id,
          risk_type: "escrow_missing",
          severity: "high",
          message: "Booking confirmed but escrow not funded",
          metadata: { status: booking.status },
        });
      }

      // Risk 2: Start soon but unconfirmed (< 24h)
      if (booking.checkin_window_start && booking.status === "pending") {
        const startTime = new Date(booking.checkin_window_start);
        const hoursUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        if (hoursUntilStart < 24 && hoursUntilStart > 0) {
          risksDetected.push({
            booking_id: booking.id,
            risk_type: "start_soon_unconfirmed",
            severity: hoursUntilStart < 6 ? "critical" : "high",
            message: `Booking starts in ${Math.round(hoursUntilStart)} hours but not confirmed`,
            metadata: { hours_until_start: hoursUntilStart },
          });
        }
      }

      // Risk 3: Check-in window passed without check-in
      if (booking.checkin_window_end && booking.status === "confirmed") {
        const checkInEnd = new Date(booking.checkin_window_end);
        if (now > checkInEnd) {
          risksDetected.push({
            booking_id: booking.id,
            risk_type: "no_checkin",
            severity: "medium",
            message: "Check-in window passed without professional check-in",
            metadata: { checkin_window_end: booking.checkin_window_end },
          });
        }
      }

      // Risk 4: Eligible for auto-complete but not completed
      if (booking.auto_complete_eligible_at && booking.status === "in_progress") {
        const eligibleAt = new Date(booking.auto_complete_eligible_at);
        if (now > eligibleAt) {
          risksDetected.push({
            booking_id: booking.id,
            risk_type: "delayed_completion",
            severity: "low",
            message: "Booking eligible for auto-completion",
            metadata: { eligible_since: booking.auto_complete_eligible_at },
          });
        }
      }
    }

    // Insert new risk flags (only if not already flagged)
    if (risksDetected.length > 0) {
      // Check existing unresolved flags
      const { data: existingFlags } = await supabase
        .from("booking_risk_flags")
        .select("booking_id, risk_type")
        .is("resolved_at", null);

      const existingFlagKeys = new Set(
        (existingFlags || []).map((f: any) => `${f.booking_id}:${f.risk_type}`)
      );

      const newFlags = risksDetected.filter(
        (risk) => !existingFlagKeys.has(`${risk.booking_id}:${risk.risk_type}`)
      );

      if (newFlags.length > 0) {
        const { error: insertError } = await supabase
          .from("booking_risk_flags")
          .insert(newFlags);

        if (insertError) throw insertError;

        // Create admin notifications for critical risks
        const criticalFlags = newFlags.filter((f) => f.severity === "critical");
        for (const flag of criticalFlags) {
          await supabase.from("activity_feed").insert({
            user_id: (await supabase.from("bookings").select("client_id").eq("id", flag.booking_id).single()).data?.client_id,
            title: "Critical Booking Risk",
            description: flag.message,
            event_type: "booking_risk",
            entity_type: "booking",
            entity_id: flag.booking_id,
            priority: "urgent",
            notification_type: "system_alert",
          });
        }

        console.log(`Inserted ${newFlags.length} new risk flags`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        bookings_checked: bookings?.length || 0,
        risks_detected: risksDetected.length,
        new_flags_created: risksDetected.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Booking risk monitor error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
