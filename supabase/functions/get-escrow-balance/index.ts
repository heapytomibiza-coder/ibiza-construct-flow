/**
 * Get Escrow Balance Edge Function
 * Returns escrow account balance breakdown for a job
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { serverClient } from "../_shared/client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = serverClient(req);
  
  try {
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Parse request
    const { jobId } = await req.json();

    if (!jobId) {
      throw new Error("Invalid request: jobId required");
    }

    // Fetch all escrow transactions for job
    const { data: transactions, error: txError } = await supabase
      .from('escrow_transactions')
      .select(`
        *,
        escrow_payment:escrow_payments!inner(
          job_id,
          client_id,
          status
        )
      `)
      .eq('escrow_payment.job_id', jobId);

    if (txError) {
      console.error('Transaction fetch error:', txError);
      throw new Error('Failed to fetch escrow balance');
    }

    // Calculate balance breakdown
    let held = 0;
    let released = 0;
    let refunded = 0;
    let pending = 0;

    transactions?.forEach(tx => {
      const amount = tx.amount || 0;
      
      switch (tx.transaction_type) {
        case 'deposit':
          if (tx.status === 'completed') {
            held += amount;
          } else {
            pending += amount;
          }
          break;
        case 'release':
          if (tx.status === 'completed') {
            released += amount;
            held -= amount;
          }
          break;
        case 'refund':
          if (tx.status === 'completed') {
            refunded += amount;
            held -= amount;
          }
          break;
      }
    });

    const balance = held;

    return new Response(
      JSON.stringify({
        balance,
        held,
        released,
        refunded,
        pending,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Get escrow balance error:', error);
    return new Response(
      JSON.stringify({ 
        balance: 0,
        error: error.message || 'Failed to fetch balance'
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
