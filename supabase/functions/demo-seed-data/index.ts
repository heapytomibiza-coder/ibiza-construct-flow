import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Demo professional profiles
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
        }
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
        }
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
        }
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
        }
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
        }
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
        }
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
        }
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
        }
      },
    ];

    // Demo client accounts
    const clients = [
      {
        email: 'client1@demo.com',
        password: 'Demo2025!',
        profile: {
          display_name: 'John Smith',
        }
      },
      {
        email: 'client2@demo.com',
        password: 'Demo2025!',
        profile: {
          display_name: 'Sarah Johnson',
        }
      },
      {
        email: 'client3@demo.com',
        password: 'Demo2025!',
        profile: {
          display_name: 'Robert Williams',
        }
      },
    ];

    const results: {
      professionals: Array<{ email: string; status: string }>;
      clients: Array<{ email: string; status: string }>;
      jobs: Array<{ title: string; status: string }>;
      errors: Array<{ email?: string; job?: string; error: string }>;
    } = {
      professionals: [],
      clients: [],
      jobs: [],
      errors: [],
    };

    // Create professional accounts
    for (const prof of professionals) {
      try {
        // Sign up user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: prof.email,
          password: prof.password,
          email_confirm: true,
        });

        if (authError) throw authError;

        // Update profile
        await supabase.from('profiles').update({
          display_name: prof.profile.display_name,
        }).eq('id', authData.user.id);

        // Add professional role
        await supabase.from('user_roles').insert({
          user_id: authData.user.id,
          role: 'professional',
        });

        // Create professional profile
        await supabase.from('professional_profiles').insert({
          user_id: authData.user.id,
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

        results.professionals.push({ email: prof.email, status: 'created' });
      } catch (error) {
        results.errors.push({ email: prof.email, error: (error as Error).message });
      }
    }

    // Create client accounts
    for (const client of clients) {
      try {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: client.email,
          password: client.password,
          email_confirm: true,
        });

        if (authError) throw authError;

        await supabase.from('profiles').update({
          display_name: client.profile.display_name,
        }).eq('id', authData.user.id);

        await supabase.from('user_roles').insert({
          user_id: authData.user.id,
          role: 'client',
        });

        results.clients.push({ email: client.email, status: 'created' });
      } catch (error) {
        results.errors.push({ email: client.email, error: (error as Error).message });
      }
    }

    // Create demo jobs (using first client)
    const firstClient = await supabase.auth.admin.listUsers();
    const clientUser = firstClient.data.users.find(u => u.email === 'client1@demo.com');

    if (clientUser) {
      const demoJobs = [
        {
          title: 'Kitchen Renovation - Villa in Talamanca',
          description: 'Complete kitchen remodel including new cabinets, countertops, and appliances. Approximately 25m².',
          micro_slug: 'kitchen-renovation',
          budget_range: '€5000 - €15000',
          general_answers: {
            address_area: 'Talamanca',
            parking: 'Driveway available',
            access_notes: 'Ground floor',
            preferred_timeslot: 'Next 2 weeks',
            schedule_detail: 'Morning (8AM - 12PM)',
            budget_band: '€2500+',
            contact_method: 'WhatsApp',
          },
          status: 'open',
        },
        {
          title: 'Electrical Installation - Solar Panels',
          description: 'Install 10kW solar panel system on flat roof. Property is in Sant Antoni.',
          micro_slug: 'solar-installation',
          budget_range: '€10000 - €20000',
          general_answers: {
            address_area: 'Sant Antoni de Portmany',
            parking: 'Street parking nearby',
            access_notes: 'Elevator available',
            preferred_timeslot: 'Flexible timing',
            budget_band: '€2500+',
            contact_method: 'Phone call',
          },
          status: 'open',
        },
        {
          title: 'Pool Repair - Leaking Pump',
          description: 'Pool pump is leaking and needs repair or replacement. Urgent.',
          micro_slug: 'pool-repair',
          budget_range: '€500 - €2000',
          general_answers: {
            address_area: 'Cala Vadella',
            parking: 'Driveway available',
            access_notes: 'Gated community',
            preferred_timeslot: 'ASAP (within 48h)',
            schedule_detail: 'Morning (8AM - 12PM)',
            budget_band: '€500 - €1000',
            contact_method: 'WhatsApp',
          },
          status: 'open',
        },
        {
          title: 'Interior Painting - 3 Bedroom Apartment',
          description: 'Paint all interior walls and ceilings. White with feature wall in living room.',
          micro_slug: 'interior-painting',
          budget_range: '€2000 - €5000',
          general_answers: {
            address_area: 'Eivissa (Ibiza Town)',
            parking: 'Paid parking nearby',
            access_notes: 'Stairs only',
            preferred_timeslot: 'This week',
            schedule_detail: 'Afternoon (12PM - 6PM)',
            budget_band: '€1000 - €2500',
            contact_method: 'Email only',
          },
          status: 'open',
        },
        {
          title: 'Garden Maintenance - Monthly Service',
          description: 'Looking for regular monthly garden maintenance for large villa garden (500m²).',
          micro_slug: 'garden-maintenance',
          budget_range: '€300 - €600/month',
          general_answers: {
            address_area: 'Es Cubells',
            parking: 'Driveway available',
            access_notes: 'Ground floor',
            preferred_timeslot: 'Flexible timing',
            budget_band: '€250 - €500',
            contact_method: 'WhatsApp',
          },
          status: 'open',
        },
      ];

      for (const job of demoJobs) {
        try {
          const { error: jobError } = await supabase.from('bookings').insert({
            client_id: clientUser.id,
            title: job.title,
            description: job.description,
            micro_slug: job.micro_slug,
            budget_range: job.budget_range,
            general_answers: job.general_answers,
            status: job.status,
          });

          if (jobError) throw jobError;
          results.jobs.push({ title: job.title, status: 'created' });
        } catch (error) {
          results.errors.push({ job: job.title, error: (error as Error).message });
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Demo data seeded successfully',
      results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error seeding demo data:', error);
    return new Response(JSON.stringify({
      error: (error as Error).message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
