import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

type SeedResults = {
  quoteRequests: Array<{ job: string; professional: string; status: string }>;
  quotes: Array<{ job: string; status: string }>;
  conversations: Array<{ participants: string; status: string }>;
  reviews: Array<{ professional: string; rating: number; status: string }>;
  contracts: Array<{ job: string; status: string }>;
  errors: Array<{ entity: string; error: string }>;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results: SeedResults = {
      quoteRequests: [],
      quotes: [],
      conversations: [],
      reviews: [],
      contracts: [],
      errors: [],
    };

    // Get demo users
    const { data: profProfiles } = await supabase
      .from('professional_profiles')
      .select('user_id')
      .limit(8);

    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', profProfiles?.map(p => p.user_id) || []);

    const professionals = profProfiles?.map(pp => ({
      user_id: pp.user_id,
      display_name: allProfiles?.find(ap => ap.id === pp.user_id)?.display_name || 'Professional'
    }));

    // Get client users
    const { data: users } = await supabase.auth.admin.listUsers();
    const client1 = users.users?.find(u => u.email === 'client1@demo.com');
    const client2 = users.users?.find(u => u.email === 'client2@demo.com');

    // Get demo jobs
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, title, client_id, budget_value, status')
      .eq('status', 'open')
      .limit(5);

    if (!jobs || jobs.length === 0) {
      throw new Error('No demo jobs found. Please run demo-seed-data first.');
    }

    // ========== STEP 1: CREATE QUOTE REQUESTS & QUOTES ==========
    const quotesData = [
      {
        jobIndex: 0, // Kitchen Renovation
        profIndex: 0, // Carlos (Builder)
        amount: 9500,
        breakdown: {
          demolition: 1200,
          cabinets: 4500,
          countertops: 2300,
          plumbing: 1500,
        },
        inclusions: ['Premium cabinets', 'Granite countertops', 'All materials', 'Cleanup'],
        notes: 'Complete kitchen renovation. 14 days delivery. Premium quality materials included.',
      },
      {
        jobIndex: 1, // Solar Panels
        profIndex: 1, // Elena (Electrician)
        amount: 14500,
        breakdown: {
          panels: 8000,
          inverter: 4000,
          installation: 2000,
          permits: 500,
        },
        inclusions: ['20x 500W panels', 'Inverter system', 'Battery storage', '25-year warranty'],
        notes: '10kW solar installation. 10 days delivery. Full certification included.',
      },
      {
        jobIndex: 2, // Pool Repair
        profIndex: 2, // Miguel (Plumber)
        amount: 850,
        breakdown: {
          repair: 450,
          testing: 200,
          emergency_fee: 200,
        },
        inclusions: ['Pump seal replacement', 'Full system test', 'Emergency service'],
        notes: 'Same-day emergency pool pump repair. 2 days delivery.',
      },
      {
        jobIndex: 3, // Interior Painting
        profIndex: 3, // Sofia (Painter)
        amount: 3200,
        breakdown: {
          preparation: 600,
          materials: 1200,
          labor: 1400,
        },
        inclusions: ['Surface prep', 'Premium paint', '2 coats', 'Cleanup'],
        notes: '3-bedroom apartment painting. 7 days delivery.',
      },
      {
        jobIndex: 4, // Garden Maintenance
        profIndex: 6, // Marco (Landscaper)
        amount: 350,
        breakdown: {
          mowing: 150,
          hedges: 100,
          weeding: 100,
        },
        inclusions: ['Lawn mowing', 'Hedge trimming', 'Weeding', 'Garden bed care'],
        notes: 'Monthly garden maintenance package. Same day service.',
      },
    ];

    const createdQuoteRequests: any[] = [];

    for (const quote of quotesData) {
      try {
        const job = jobs[quote.jobIndex];
        const prof = professionals?.[quote.profIndex];

        if (!job || !prof) continue;

        // Create quote request
        const { data: quoteRequest, error: reqError } = await supabase
          .from('quote_requests')
          .insert({
            job_id: job.id,
            professional_id: prof.user_id,
            status: 'sent',
            message: `Quote request for ${job.title}`,
          })
          .select()
          .single();

        if (reqError) throw reqError;

        createdQuoteRequests.push(quoteRequest);

        // Create quote
        const { error: quoteError } = await supabase
          .from('quotes')
          .insert({
            quote_request_id: quoteRequest.id,
            amount: quote.amount,
            breakdown: quote.breakdown,
            inclusions: quote.inclusions,
            notes: quote.notes,
            valid_until: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
          });

        if (quoteError) throw quoteError;

        results.quoteRequests.push({
          job: job.title,
          professional: prof.display_name,
          status: 'created',
        });

        results.quotes.push({
          job: job.title,
          status: 'created',
        });
      } catch (e) {
        results.errors.push({
          entity: `Quote for job ${quote.jobIndex}`,
          error: (e as Error).message,
        });
      }
    }

    // ========== STEP 2: CREATE CONVERSATIONS ==========
    const conversationsData = [
      {
        jobIndex: 0,
        profIndex: 0,
        messages: [
          {
            fromClient: true,
            content: 'Hi Carlos, I saw your quote for the kitchen renovation. Do you have availability to start next week?',
            hoursAgo: 24,
          },
          {
            fromClient: false,
            content: 'Hello! Yes, I can start next Monday. I\'ll need 2 days for demolition, then we begin the installation.',
            hoursAgo: 22,
          },
          {
            fromClient: true,
            content: 'Perfect! Can you confirm the materials are included in the quote?',
            hoursAgo: 21,
          },
          {
            fromClient: false,
            content: 'Yes, all materials are included - cabinets, granite countertops, fixtures. I can send you the product specs if you\'d like.',
            hoursAgo: 20,
          },
        ],
      },
      {
        jobIndex: 1,
        profIndex: 1,
        messages: [
          {
            fromClient: true,
            content: 'Hi Elena, I\'m interested in your solar panel quote. What warranty do the panels have?',
            hoursAgo: 12,
          },
          {
            fromClient: false,
            content: 'Great question! The panels have a 25-year performance warranty and the inverter has 10 years. I also offer 5 years of free maintenance.',
            hoursAgo: 11,
          },
        ],
      },
    ];

    for (const conv of conversationsData) {
      try {
        const job = jobs[conv.jobIndex];
        const prof = professionals?.[conv.profIndex];

        if (!job || !prof) continue;

        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            job_id: job.id,
            participant_1_id: job.client_id,
            participant_2_id: prof.user_id,
            last_message_at: new Date(Date.now() - conv.messages[conv.messages.length - 1].hoursAgo * 3600000).toISOString(),
          })
          .select()
          .single();

        if (convError) throw convError;

        // Insert messages
        for (const msg of conv.messages) {
          await supabase.from('messages').insert({
            conversation_id: conversation.id,
            sender_id: msg.fromClient ? job.client_id : prof.user_id,
            recipient_id: msg.fromClient ? prof.user_id : job.client_id,
            content: msg.content,
            created_at: new Date(Date.now() - msg.hoursAgo * 3600000).toISOString(),
          });
        }

        results.conversations.push({
          participants: `${job.client_id} <-> ${prof.user_id}`,
          status: 'created',
        });
      } catch (e) {
        results.errors.push({
          entity: 'Conversation',
          error: (e as Error).message,
        });
      }
    }

    // ========== STEP 3: CREATE REVIEWS ==========
    const reviewsData = [
      {
        profIndex: 0,
        clientId: client1?.id,
        jobIndex: 0,
        rating: 5,
        title: 'Outstanding Kitchen Renovation!',
        comment: 'Carlos did an amazing job on our kitchen! Professional, on time, and excellent quality work. Highly recommended!',
        categoryRatings: {
          quality: 5,
          communication: 5,
          timeliness: 5,
          professionalism: 5,
        },
      },
      {
        profIndex: 1,
        clientId: client2?.id,
        jobIndex: 1,
        rating: 5,
        title: 'Expert Solar Installation',
        comment: 'Elena installed our solar system perfectly. Very knowledgeable and explained everything clearly. Great experience!',
        categoryRatings: {
          quality: 5,
          communication: 5,
          timeliness: 5,
          professionalism: 5,
        },
      },
      {
        profIndex: 2,
        clientId: client1?.id,
        jobIndex: 2,
        rating: 4,
        title: 'Quick Pool Repair',
        comment: 'Quick response and fixed our pool pump efficiently. Would have been 5 stars but arrived 30 mins late.',
        categoryRatings: {
          quality: 5,
          communication: 4,
          timeliness: 3,
          professionalism: 4,
        },
      },
      {
        profIndex: 3,
        clientId: client2?.id,
        jobIndex: 3,
        rating: 5,
        title: 'Beautiful Paint Job',
        comment: 'Sofia transformed our apartment! Clean work, great attention to detail, and finished on schedule.',
        categoryRatings: {
          quality: 5,
          communication: 5,
          timeliness: 5,
          professionalism: 5,
        },
      },
    ];

    for (const review of reviewsData) {
      try {
        const prof = professionals?.[review.profIndex];
        const job = jobs[review.jobIndex];

        if (!prof || !review.clientId || !job) continue;

        await supabase.from('reviews').insert({
          job_id: job.id,
          reviewer_id: review.clientId,
          reviewee_id: prof.user_id,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          category_ratings: review.categoryRatings,
          is_verified: true,
          moderation_status: 'approved',
        });

        results.reviews.push({
          professional: prof.display_name,
          rating: review.rating,
          status: 'created',
        });
      } catch (e) {
        results.errors.push({
          entity: `Review for prof ${review.profIndex}`,
          error: (e as Error).message,
        });
      }
    }

    // ========== STEP 4: ACCEPT ONE QUOTE & CREATE CONTRACT ==========
    try {
      if (createdQuoteRequests.length > 0) {
        const firstRequest = createdQuoteRequests[0];
        
        // Update quote request status to accepted
        await supabase
          .from('quote_requests')
          .update({ status: 'accepted' })
          .eq('id', firstRequest.id);

        // Create contract
        const { error: contractError } = await supabase
          .from('contracts')
          .insert({
            job_id: firstRequest.job_id,
            tasker_id: firstRequest.professional_id,
            client_id: jobs[0].client_id,
            agreed_amount: quotesData[0].amount,
            type: 'fixed',
            escrow_status: 'pending',
          });

        if (!contractError) {
          results.contracts.push({
            job: jobs[0].title,
            status: 'created',
          });
        }
      }
    } catch (e) {
      results.errors.push({
        entity: 'Contract creation',
        error: (e as Error).message,
      });
    }

    const success = results.errors.length === 0;

    return new Response(
      JSON.stringify({
        success,
        message: success
          ? 'Phase 2 demo data seeded successfully'
          : 'Phase 2 demo data seeded with some errors',
        results,
        summary: {
          quoteRequests: results.quoteRequests.length,
          quotes: results.quotes.length,
          conversations: results.conversations.length,
          reviews: results.reviews.length,
          contracts: results.contracts.length,
          errors: results.errors.length,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error seeding phase 2 demo data:', error);
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
