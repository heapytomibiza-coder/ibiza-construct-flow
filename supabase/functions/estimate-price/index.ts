import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { serviceType, category, subcategory, answers, location } = await req.json();

    if (!serviceType || !answers) {
      return new Response(JSON.stringify({ error: "Service type and answers are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `Analyze the following service request and provide an intelligent price estimate:

Service: ${serviceType} (${category} > ${subcategory})
Location: ${location || 'Not specified'}
User Answers: ${JSON.stringify(answers)}

Consider:
1. Labor complexity and time requirements
2. Material costs and specifications
3. Regional pricing variations
4. Skill level required
5. Market rates for similar services
6. Project scope and complexity

Provide a JSON response with this structure:
{
  "estimatedPrice": {
    "min": 150,
    "max": 350,
    "currency": "USD"
  },
  "priceFactors": [
    "Material complexity adds 20-30%",
    "Location requires specialized access",
    "Timeline affects labor costs"
  ],
  "confidenceLevel": "high|medium|low",
  "explanation": "Brief explanation of the estimate",
  "timeline": "Estimated completion time"
}

Be realistic and base estimates on actual market conditions.`;

    console.log("Estimating price for:", { serviceType, category, subcategory });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: "You are an expert pricing analyst for professional services. Provide realistic, market-based price estimates with clear explanations. Always return valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI Gateway error:", await response.text());
      return new Response(JSON.stringify({ error: "Failed to estimate price" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      console.error("No response from AI", data);
      return new Response(JSON.stringify({ error: "No response from AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse the JSON response from AI
    let estimate;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
      estimate = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, aiResponse);
      return new Response(JSON.stringify({ error: "Invalid AI response format" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Generated price estimate:", estimate);

    return new Response(JSON.stringify(estimate), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error estimating price:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});