/**
 * Weekly Review Digest Edge Function
 * Sends weekly summary emails for users with pending reviews and activity
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DigestData {
  userId: string;
  email: string;
  fullName: string;
  newReviewsReceived: number;
  pendingReviews: Array<{
    contractId: string;
    jobTitle: string;
    role: 'client' | 'professional';
    daysAgo: number;
  }>;
  helpfulVotes: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    console.log('Starting weekly review digest generation...');

    // Get users who have digest enabled
    const { data: preferences, error: prefsError } = await supabase
      .from('notification_preferences')
      .select('user_id, email_digest_enabled')
      .eq('email_digest_enabled', true);

    if (prefsError) {
      console.error('Error fetching preferences:', prefsError);
      throw prefsError;
    }

    console.log(`Found ${preferences?.length || 0} users with digest enabled`);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const digests: DigestData[] = [];

    for (const pref of preferences || []) {
      const userId = pref.user_id;

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      if (!profile?.email) continue;

      // Count new reviews received this week
      const { count: newReviewsCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .or(`professional_id.eq.${userId},client_id.eq.${userId}`)
        .gte('created_at', oneWeekAgo.toISOString());

      // Get pending review reminders
      const { data: pendingReminders } = await supabase
        .from('activity_feed')
        .select('entity_id, metadata, created_at')
        .eq('user_id', userId)
        .eq('event_type', 'review_reminder')
        .is('read_at', null)
        .is('dismissed_at', null)
        .order('created_at', { ascending: false });

      const pendingReviews = [];
      for (const reminder of pendingReminders || []) {
        const contractId = reminder.entity_id;
        if (!contractId) continue;

        // Get contract details
        const { data: contract } = await supabase
          .from('contracts')
          .select('job_id, client_id, tasker_id')
          .eq('id', contractId)
          .single();

        if (!contract) continue;

        // Get job details
        const { data: job } = await supabase
          .from('jobs')
          .select('title')
          .eq('id', contract.job_id)
          .single();

        const metadata = reminder.metadata as any;
        const daysAgo = Math.floor(
          (Date.now() - new Date(reminder.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        pendingReviews.push({
          contractId,
          jobTitle: job?.title || 'Completed Job',
          role: (contract.client_id === userId ? 'client' : 'professional') as 'client' | 'professional',
          daysAgo,
        });
      }

      // Count helpful votes received this week (if review_helpful_votes table exists)
      let helpfulVotesCount = 0;
      try {
        const { data: userReviews } = await supabase
          .from('reviews')
          .select('id')
          .or(`professional_id.eq.${userId},client_id.eq.${userId}`);

        if (userReviews && userReviews.length > 0) {
          const reviewIds = userReviews.map(r => r.id);
          const { count } = await supabase
            .from('review_helpful_votes')
            .select('*', { count: 'exact', head: true })
            .in('review_id', reviewIds)
            .gte('created_at', oneWeekAgo.toISOString());

          helpfulVotesCount = count || 0;
        }
      } catch (err) {
        // Table might not exist yet, skip
        console.log('Helpful votes table not available, skipping...');
      }

      // Only create digest if there's meaningful activity
      if ((newReviewsCount || 0) > 0 || pendingReviews.length > 0 || helpfulVotesCount > 0) {
        digests.push({
          userId,
          email: profile.email,
          fullName: profile.full_name || 'User',
          newReviewsReceived: newReviewsCount || 0,
          pendingReviews,
          helpfulVotes: helpfulVotesCount,
        });
      }
    }

    console.log(`Generated ${digests.length} digests to send`);

    // Send digest emails
    for (const digest of digests) {
      await sendDigestEmail(digest);
    }

    return new Response(
      JSON.stringify({
        success: true,
        digestsSent: digests.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in send-weekly-review-digest:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function sendDigestEmail(digest: DigestData): Promise<void> {
  console.log(`Sending weekly digest to ${digest.email}...`);

  const subject = `Your Weekly Review Summary`;

  let body = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Hi ${digest.fullName},</h2>
      <p style="color: #666;">Here's your weekly review activity summary:</p>
  `;

  if (digest.newReviewsReceived > 0) {
    body += `
      <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <h3 style="color: #0284c7; margin: 0 0 10px 0;">📊 ${digest.newReviewsReceived} New Review${digest.newReviewsReceived > 1 ? 's' : ''} Received</h3>
        <p style="color: #666; margin: 0;">You received ${digest.newReviewsReceived} new review${digest.newReviewsReceived > 1 ? 's' : ''} this week!</p>
      </div>
    `;
  }

  if (digest.pendingReviews.length > 0) {
    body += `
      <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <h3 style="color: #d97706; margin: 0 0 10px 0;">⏳ ${digest.pendingReviews.length} Review${digest.pendingReviews.length > 1 ? 's' : ''} Waiting</h3>
        <p style="color: #666; margin: 0 0 10px 0;">You have ${digest.pendingReviews.length} completed contract${digest.pendingReviews.length > 1 ? 's' : ''} waiting for your feedback:</p>
        <ul style="color: #666; margin: 0; padding-left: 20px;">
    `;

    for (const review of digest.pendingReviews.slice(0, 5)) {
      body += `
          <li style="margin: 5px 0;">
            ${review.jobTitle} (as ${review.role}) - ${review.daysAgo} day${review.daysAgo > 1 ? 's' : ''} ago
          </li>
      `;
    }

    if (digest.pendingReviews.length > 5) {
      body += `<li style="margin: 5px 0;">...and ${digest.pendingReviews.length - 5} more</li>`;
    }

    body += `
        </ul>
      </div>
    `;
  }

  if (digest.helpfulVotes > 0) {
    body += `
      <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <h3 style="color: #16a34a; margin: 0 0 10px 0;">👍 ${digest.helpfulVotes} Helpful Vote${digest.helpfulVotes > 1 ? 's' : ''}</h3>
        <p style="color: #666; margin: 0;">Your reviews received ${digest.helpfulVotes} helpful vote${digest.helpfulVotes > 1 ? 's' : ''} this week!</p>
      </div>
    `;
  }

  body += `
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #666; font-size: 14px;">
          <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app')}/reviews" 
             style="color: #0284c7; text-decoration: none;">View all reviews →</a>
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 20px;">
          You're receiving this because you enabled weekly review digests. 
          You can adjust your notification preferences in your account settings.
        </p>
      </div>
    </div>
  `;

  // Here you would integrate with your email service (e.g., Resend, SendGrid)
  // For now, we'll create an activity feed entry
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  await supabase.from('activity_feed').insert({
    user_id: digest.userId,
    event_type: 'weekly_digest_sent',
    title: 'Weekly Review Summary',
    description: `${digest.newReviewsReceived} new reviews, ${digest.pendingReviews.length} pending`,
    metadata: { 
      type: 'digest',
      newReviews: digest.newReviewsReceived,
      pendingReviews: digest.pendingReviews.length,
      helpfulVotes: digest.helpfulVotes,
    },
  });

  console.log(`Digest sent to ${digest.email}`);
}
