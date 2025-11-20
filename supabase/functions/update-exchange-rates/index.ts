import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getErrorMessage } from '../_shared/errorUtils.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Free exchange rate API - you can replace with a paid service for production
const EXCHANGE_RATE_API = "https://api.exchangerate-api.com/v4/latest/EUR";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    console.log("Fetching latest exchange rates...");

    // Fetch latest rates
    const response = await fetch(EXCHANGE_RATE_API);
    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates: ${response.statusText}`);
    }

    const data = await response.json();
    const rates = data.rates;
    const baseCurrency = data.base || "EUR";

    console.log(`Received rates for ${Object.keys(rates).length} currencies`);

    // Supported currencies
    const supportedCurrencies = ["EUR", "USD", "GBP", "JPY", "CHF", "CAD", "AUD"];

    // Prepare exchange rate updates
    const updates = [];
    for (const fromCurrency of supportedCurrencies) {
      for (const toCurrency of supportedCurrencies) {
        if (fromCurrency === toCurrency) continue;

        let rate: number;
        if (fromCurrency === baseCurrency) {
          rate = rates[toCurrency];
        } else if (toCurrency === baseCurrency) {
          rate = 1 / rates[fromCurrency];
        } else {
          // Convert via base currency
          rate = rates[toCurrency] / rates[fromCurrency];
        }

        if (rate) {
          updates.push({
            from_currency: fromCurrency,
            to_currency: toCurrency,
            rate: rate,
          });
        }
      }
    }

    console.log(`Updating ${updates.length} exchange rate pairs...`);

    // Update exchange rates in batches
    const batchSize = 10;
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);

      for (const update of batch) {
        const { error } = await supabaseClient
          .from("exchange_rates")
          .upsert(
            {
              from_currency: update.from_currency,
              to_currency: update.to_currency,
              rate: update.rate,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "from_currency,to_currency",
            }
          );

        if (error) {
          console.error(`Error updating rate ${update.from_currency}→${update.to_currency}:`, error);
        }
      }
    }

    console.log("Exchange rates updated successfully");

    return new Response(
      JSON.stringify({
        success: true,
        updated: updates.length,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in update-exchange-rates:", error);
    return new Response(
      JSON.stringify({ error: getErrorMessage(error) }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
