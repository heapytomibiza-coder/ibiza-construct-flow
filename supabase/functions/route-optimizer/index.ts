import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { professionalId, availabilitySlots, maxTravelTime = 30 } = await req.json();

    if (!professionalId || !availabilitySlots) {
      throw new Error('Professional ID and availability slots are required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Optimizing routes for professional:', professionalId);

    // Get professional's location and skills
    const { data: professional, error: proError } = await supabase
      .from('profiles')
      .select('location, skills, service_areas')
      .eq('id', professionalId)
      .single();

    if (proError) throw proError;

    // Get available leads within service areas
    const { data: leads, error: leadsError } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'pending')
      .is('professional_id', null);

    if (leadsError) throw leadsError;

    // Filter leads by distance and skills match
    const viableLeads = leads.filter(lead => {
      return isWithinServiceArea(lead, professional) && 
             hasRequiredSkills(lead, professional);
    });

    // Optimize routes for each availability slot
    const optimizedSlots = [];

    for (const slot of availabilitySlots) {
      const slotLeads = viableLeads.filter(lead => 
        fitsInTimeSlot(lead, slot)
      );

      if (slotLeads.length === 0) continue;

      // Calculate optimal route
      const optimizedRoute = calculateOptimalRoute(
        slotLeads, 
        professional.location, 
        slot,
        maxTravelTime
      );

      if (optimizedRoute.leads.length > 0) {
        optimizedSlots.push({
          slot,
          leads: optimizedRoute.leads,
          totalTravelTime: optimizedRoute.totalTravelTime,
          totalRevenue: optimizedRoute.totalRevenue,
          efficiency: optimizedRoute.efficiency,
          co2Saved: optimizedRoute.co2Saved
        });
      }
    }

    // Generate suggestions for gap filling
    const gapSuggestions = generateGapSuggestions(optimizedSlots, viableLeads);

    // Log the optimization
    const { error: logError } = await supabase
      .from('ai_runs')
      .insert({
        function_name: 'route-optimizer',
        input_data: { professionalId, availabilitySlots },
        output_data: { optimizedSlots, gapSuggestions },
        success: true,
        execution_time_ms: Date.now()
      });

    if (logError) {
      console.error('Error logging AI run:', logError);
    }

    return new Response(
      JSON.stringify({ 
        optimizedSlots,
        gapSuggestions,
        totalPotentialRevenue: optimizedSlots.reduce((sum, slot) => sum + slot.totalRevenue, 0),
        totalCo2Saved: optimizedSlots.reduce((sum, slot) => sum + slot.co2Saved, 0)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in route optimizer:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function isWithinServiceArea(lead: any, professional: any) {
  // Simplified distance calculation - in real implementation would use proper geolocation
  const maxDistance = professional.service_areas?.max_radius || 25; // km
  const distance = calculateDistance(lead.location, professional.location);
  return distance <= maxDistance;
}

function hasRequiredSkills(lead: any, professional: any) {
  const requiredSkills = lead.required_skills || [];
  const proSkills = professional.skills || [];
  
  return requiredSkills.every(skill => 
    proSkills.some(proSkill => proSkill.toLowerCase() === skill.toLowerCase())
  );
}

function fitsInTimeSlot(lead: any, slot: any) {
  const leadDuration = lead.estimated_duration || 2; // hours
  const slotDuration = (new Date(slot.end).getTime() - new Date(slot.start).getTime()) / (1000 * 60 * 60);
  return leadDuration <= slotDuration;
}

function calculateOptimalRoute(leads: any[], baseLocation: any, slot: any, maxTravelTime: number) {
  // Simplified route optimization using greedy nearest neighbor
  const route = [];
  let currentLocation = baseLocation;
  let remainingLeads = [...leads];
  let totalTravelTime = 0;
  let totalRevenue = 0;

  while (remainingLeads.length > 0) {
    // Find nearest lead
    let nearestLead = null;
    let nearestDistance = Infinity;
    let nearestIndex = -1;

    remainingLeads.forEach((lead, index) => {
      const distance = calculateDistance(currentLocation, lead.location);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestLead = lead;
        nearestIndex = index;
      }
    });

    // Check if we can fit this lead in the remaining time
    const travelTime = nearestDistance * 2; // minutes (simplified)
    const jobDuration = (nearestLead.estimated_duration || 2) * 60; // minutes

    if (totalTravelTime + travelTime + jobDuration <= slot.duration * 60) {
      route.push(nearestLead);
      totalTravelTime += travelTime;
      totalRevenue += nearestLead.total_price || 0;
      currentLocation = nearestLead.location;
      remainingLeads.splice(nearestIndex, 1);
    } else {
      break;
    }
  }

  return {
    leads: route,
    totalTravelTime,
    totalRevenue,
    efficiency: route.length > 0 ? totalRevenue / (totalTravelTime + route.length * 60) : 0,
    co2Saved: calculateCo2Savings(route.length)
  };
}

function generateGapSuggestions(optimizedSlots: any[], allLeads: any[]) {
  const assignedLeadIds = new Set(
    optimizedSlots.flatMap(slot => slot.leads.map((lead: any) => lead.id))
  );

  const unassignedLeads = allLeads.filter(lead => !assignedLeadIds.has(lead.id));

  return unassignedLeads.slice(0, 5).map(lead => ({
    lead,
    reason: 'Could fit in shorter availability window',
    suggestedAction: 'Consider adding 2-hour availability slot',
    potentialRevenue: lead.total_price || 0
  }));
}

function calculateDistance(location1: any, location2: any) {
  // Simplified distance calculation - returns km
  // In real implementation, would use proper geolocation APIs
  const lat1 = location1?.lat || 0;
  const lon1 = location1?.lng || 0;
  const lat2 = location2?.lat || 0;
  const lon2 = location2?.lng || 0;

  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateCo2Savings(routeLength: number) {
  // Estimate CO2 savings from optimized routing
  // Assumes 0.2kg CO2 per km saved
  const avgSavingsPerRoute = routeLength * 5; // km saved by optimization
  return avgSavingsPerRoute * 0.2; // kg CO2
}