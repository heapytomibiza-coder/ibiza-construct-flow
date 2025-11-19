import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

type DemoResults = {
  microServices: Array<{ micro: string; status: string; id?: string }>;
  professionals: Array<{ email: string; status: string }>;
  clients: Array<{ email: string; status: string }>;
  jobs: Array<{ title: string; status: string }>;
  errors: Array<{ email?: string; job?: string; service?: string; error: string }>;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results: DemoResults = {
      microServices: [],
      professionals: [],
      clients: [],
      jobs: [],
      errors: [],
    };

    // Helper: Upsert user (create if not exists)
    const ensureUser = async (email: string, password: string) => {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (error) {
        if ((error as any).message?.includes('already registered')) {
          const { data: usersList } = await supabase.auth.admin.listUsers();
          const existing = usersList?.users?.find((u) => u.email === email);
          if (!existing) throw error;
          return existing;
        }
        throw error;
      }

      return data.user;
    };

    // ========== STEP 1: CREATE MICRO SERVICES ==========
    const microServicesSeed = [
      {
        micro: 'Kitchen Renovation',
        category: 'Construction',
        subcategory: 'Renovation',
      },
      {
        micro: 'Solar Panel Installation',
        category: 'Electrical',
        subcategory: 'Solar',
      },
      {
        micro: 'Pool Repair & Maintenance',
        category: 'Plumbing',
        subcategory: 'Pool',
      },
      {
        micro: 'Interior Painting',
        category: 'Painting',
        subcategory: 'Interior',
      },
      {
        micro: 'Garden Maintenance',
        category: 'Gardening',
        subcategory: 'Maintenance',
      },
    ];

    const microIdByName: Record<string, string> = {};

    // Check-then-insert pattern (no unique constraint on services_micro)
    for (const ms of microServicesSeed) {
      try {
        const { data: existing } = await supabase
          .from('services_micro')
          .select('id, micro')
          .eq('category', ms.category)
          .eq('subcategory', ms.subcategory)
          .eq('micro', ms.micro)
          .maybeSingle();

        if (existing) {
          microIdByName[ms.micro] = existing.id;
          results.microServices.push({
            micro: ms.micro,
            status: 'exists',
            id: existing.id,
          });
        } else {
          const { data: inserted, error } = await supabase
            .from('services_micro')
            .insert({
              category: ms.category,
              subcategory: ms.subcategory,
              micro: ms.micro,
              questions_micro: [],
              questions_logistics: [],
              is_active: true,
            })
            .select('id')
            .single();

          if (error) throw error;

          microIdByName[ms.micro] = inserted.id;
          results.microServices.push({
            micro: ms.micro,
            status: 'created',
            id: inserted.id,
          });
        }
      } catch (e) {
        results.errors.push({
          service: ms.micro,
          error: (e as Error).message,
        });
      }
    }

    // ========== STEP 2: CREATE PROFESSIONALS ==========
    const professionals = [
      {
        email: 'carlos.builder@demo.com',
        password: 'Demo2025!',
        profile: {
          display_name: 'Carlos Martínez',
          tagline: 'Master Builder - 15 Years Experience',
          bio: 'Specialized in villa renovations and new construction across Ibiza. Licensed contractor with a team of 8 skilled workers.',
          experience_years: 15,
          intro_categories: ['Building & Construction', 'Renovations'],
          service_regions: ['Eivissa (Ibiza Town)', 'Sant Antoni de Portmany', 'Santa Eulària des Riu'],
          availability: 'full_time',
        },
      },
      {
        email: 'elena.electrician@demo.com',
        password: 'Demo2025!',
        profile: {
          display_name: 'Elena Rodriguez',
          tagline: 'Licensed Electrician - Solar & Smart Homes',
          bio: 'Certified electrician specializing in solar installations and smart home systems. Available for residential and commercial projects.',
          experience_years: 8,
          intro_categories: ['Electrical', 'Solar Installation'],
          service_regions: ['Eivissa (Ibiza Town)', 'Jesús', 'Talamanca'],
          availability: 'full_time',
        },
      },
      {
        email: 'miguel.plumber@demo.com',
        password: 'Demo2025!',
        profile: {
          display_name: 'Miguel Santos',
          tagline: 'Expert Plumber - Emergency Services',
          bio: '24/7 emergency plumbing services. Pool installations, bathroom renovations, and water system repairs.',
          experience_years: 12,
          intro_categories: ['Plumbing', 'Pool Maintenance'],
          service_regions: ['Sant Antoni de Portmany', 'Cala de Bou', 'Port des Torrent'],
          availability: 'full_time',
        },
      },
      {
        email: 'sofia.painter@demo.com',
        password: 'Demo2025!',
        profile: {
          display_name: 'Sofia Lopez',
          tagline: 'Interior & Exterior Painting',
          bio: 'Professional painting services for homes and businesses. Eco-friendly paints available.',
          experience_years: 6,
          intro_categories: ['Painting & Decorating'],
          service_regions: ['Santa Eulària des Riu', 'Es Canar', 'Cala Llonga'],
          availability: 'part_time',
        },
      },
      {
        email: 'david.carpenter@demo.com',
        password: 'Demo2025!',
        profile: {
          display_name: 'David Chen',
          tagline: 'Custom Carpentry & Furniture',
          bio: 'Bespoke furniture, kitchen cabinets, and woodwork. Specializing in traditional and modern designs.',
          experience_years: 10,
          intro_categories: ['Carpentry', 'Furniture Making'],
          service_regions: ['Eivissa (Ibiza Town)', 'Sant Rafael', 'Santa Gertrudis'],
          availability: 'full_time',
        },
      },
      {
        email: 'anna.cleaner@demo.com',
        password: 'Demo2025!',
        profile: {
          display_name: 'Anna Ivanova',
          tagline: 'Professional Cleaning Services',
          bio: 'Deep cleaning for homes and rental properties. End-of-tenancy and move-in ready services.',
          experience_years: 4,
          intro_categories: ['Cleaning Services', 'Property Management'],
          service_regions: ['Playa d\'en Bossa', 'Talamanca', 'Figueretas'],
          availability: 'full_time',
        },
      },
      {
        email: 'marco.landscaper@demo.com',
        password: 'Demo2025!',
        profile: {
          display_name: 'Marco Rossi',
          tagline: 'Garden Design & Maintenance',
          bio: 'Creating and maintaining beautiful Mediterranean gardens. Irrigation systems and pool landscaping.',
          experience_years: 9,
          intro_categories: ['Gardening', 'Landscaping'],
          service_regions: ['Sant Josep de sa Talaia', 'Cala Vadella', 'Es Cubells'],
          availability: 'full_time',
        },
      },
      {
        email: 'lisa.designer@demo.com',
        password: 'Demo2025!',
        profile: {
          display_name: 'Lisa Anderson',
          tagline: 'Interior Designer - Luxury Properties',
          bio: 'Full-service interior design for villas and apartments. From concept to completion.',
          experience_years: 11,
          intro_categories: ['Interior Design', 'Property Styling'],
          service_regions: ['Roca Llisa', 'Cala Jondal', 'Es Cubells'],
          availability: 'by_appointment',
        },
      },
    ];

    for (const prof of professionals) {
      try {
        const user = await ensureUser(prof.email, prof.password);

        await supabase
          .from('profiles')
          .update({ display_name: prof.profile.display_name })
          .eq('id', user.id);

        await supabase.from('user_roles').upsert({
          user_id: user.id,
          role: 'professional',
        });

        await supabase.from('professional_profiles').upsert({
          user_id: user.id,
          tagline: prof.profile.tagline,
          bio: prof.profile.bio,
          experience_years: prof.profile.experience_years,
          intro_categories: prof.profile.intro_categories,
          service_regions: prof.profile.service_regions,
          availability: prof.profile.availability,
          onboarding_phase: 'complete',
          verification_status: 'approved',
          is_active: true,
        });

        results.professionals.push({ email: prof.email, status: 'created_or_exists' });
      } catch (e) {
        results.errors.push({
          email: prof.email,
          error: (e as Error).message,
        });
      }
    }

    // ========== STEP 3: CREATE CLIENTS ==========
    const clients = [
      {
        email: 'client1@demo.com',
        password: 'Demo2025!',
        display_name: 'John Smith',
      },
      {
        email: 'client2@demo.com',
        password: 'Demo2025!',
        display_name: 'Sarah Johnson',
      },
      {
        email: 'client3@demo.com',
        password: 'Demo2025!',
        display_name: 'Robert Williams',
      },
    ];

    let client1Id: string | null = null;

    for (const client of clients) {
      try {
        const user = await ensureUser(client.email, client.password);

        await supabase
          .from('profiles')
          .update({ display_name: client.display_name })
          .eq('id', user.id);

        await supabase.from('user_roles').upsert({
          user_id: user.id,
          role: 'client',
        });

        if (client.email === 'client1@demo.com') {
          client1Id = user.id;
        }

        results.clients.push({ email: client.email, status: 'created_or_exists' });
      } catch (e) {
        results.errors.push({
          email: client.email,
          error: (e as Error).message,
        });
      }
    }

    // ========== STEP 4: CREATE DEMO JOBS ==========
    if (client1Id) {
      const demoJobs = [
        {
          title: 'Kitchen Renovation - Villa in Talamanca',
          description: 'Complete kitchen remodel including new cabinets, countertops, and appliances. Approximately 25m².',
          microServiceName: 'Kitchen Renovation',
          budgetValue: 10000,
          answers: {
            address_area: 'Talamanca',
            parking: 'Driveway available',
            access_notes: 'Ground floor',
            preferred_timeslot: 'Next 2 weeks',
            schedule_detail: 'Morning (8AM - 12PM)',
            budget_band: '€2500+',
            contact_method: 'WhatsApp',
          },
        },
        {
          title: 'Electrical Installation - Solar Panels',
          description: 'Install 10kW solar panel system on flat roof. Property is in Sant Antoni.',
          microServiceName: 'Solar Panel Installation',
          budgetValue: 15000,
          answers: {
            address_area: 'Sant Antoni de Portmany',
            parking: 'Street parking nearby',
            access_notes: 'Elevator available',
            preferred_timeslot: 'Flexible timing',
            budget_band: '€2500+',
            contact_method: 'Phone call',
          },
        },
        {
          title: 'Pool Repair - Leaking Pump',
          description: 'Pool pump is leaking and needs repair or replacement. Urgent.',
          microServiceName: 'Pool Repair & Maintenance',
          budgetValue: 1500,
          answers: {
            address_area: 'Cala Vadella',
            parking: 'Driveway available',
            access_notes: 'Gated community',
            preferred_timeslot: 'ASAP (within 48h)',
            schedule_detail: 'Morning (8AM - 12PM)',
            budget_band: '€500 - €1000',
            contact_method: 'WhatsApp',
          },
        },
        {
          title: 'Interior Painting - 3 Bedroom Apartment',
          description: 'Paint all interior walls and ceilings. White with feature wall in living room.',
          microServiceName: 'Interior Painting',
          budgetValue: 3500,
          answers: {
            address_area: 'Eivissa (Ibiza Town)',
            parking: 'Paid parking nearby',
            access_notes: 'Stairs only',
            preferred_timeslot: 'This week',
            schedule_detail: 'Afternoon (12PM - 6PM)',
            budget_band: '€1000 - €2500',
            contact_method: 'Email only',
          },
        },
        {
          title: 'Garden Maintenance - Monthly Service',
          description: 'Looking for regular monthly garden maintenance for large villa garden (500m²).',
          microServiceName: 'Garden Maintenance',
          budgetValue: 400,
          answers: {
            address_area: 'Es Cubells',
            parking: 'Driveway available',
            access_notes: 'Ground floor',
            preferred_timeslot: 'Flexible timing',
            budget_band: '€250 - €500',
            contact_method: 'WhatsApp',
          },
        },
      ];

      for (const job of demoJobs) {
        try {
          const microId = microIdByName[job.microServiceName];
          if (!microId) {
            throw new Error(`Micro service not found: ${job.microServiceName}`);
          }

          const { error: jobError } = await supabase.from('jobs').insert({
            client_id: client1Id,
            micro_id: microId,
            title: job.title,
            description: job.description,
            budget_type: 'fixed',
            budget_value: job.budgetValue,
            answers: job.answers,
            status: 'open',
          });

          if (jobError) throw jobError;
          results.jobs.push({ title: job.title, status: 'created' });
        } catch (e) {
          results.errors.push({
            job: job.title,
            error: (e as Error).message,
          });
        }
      }
    }

    const success = results.errors.length === 0;

    return new Response(
      JSON.stringify({
        success,
        message: success
          ? 'Demo data seeded successfully'
          : 'Demo data seeded with some errors',
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error seeding demo data:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
