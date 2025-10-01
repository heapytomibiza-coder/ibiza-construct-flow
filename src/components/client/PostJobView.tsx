import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, FileText, Clock, TrendingUp, 
  Sparkles, Zap, Target, Users
} from 'lucide-react';
import EnhancedJobWizard from '@/components/wizard/EnhancedJobWizard';
import { useServicesRegistry } from '@/contexts/ServicesRegistry';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { WizardCompletePayload } from '@/lib/contracts';
import { safeValidateWizardPayload, safeValidateBookingInsert } from '@/lib/validation/jobWizard';

const PostJobView = () => {
  const { services } = useServicesRegistry();
  const { currentLanguage } = useLanguage();
  const [showWizard, setShowWizard] = useState(false);
  const [recentJobs, setRecentJobs] = useState([]);
  const [templates, setTemplates] = useState([]);

  if (showWizard) {
    return (
      <EnhancedJobWizard
        onComplete={handleJobComplete}
        onCancel={() => setShowWizard(false)}
      />
    );
  }

  async function handleJobComplete(jobData: WizardCompletePayload) {
    try {
      // Validate wizard payload
      const validationResult = safeValidateWizardPayload(jobData);
      if (!validationResult.success) {
        console.error('Validation failed:', validationResult.error.issues);
        toast.error('Invalid form data. Please check your inputs.');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to create a job');
        return;
      }

      // Prepare booking data with validation
      const bookingData = {
        client_id: user.id,
        title: validationResult.data.title,
        description: validationResult.data.description || '',
        service_id: validationResult.data.serviceId,
        // Audit tracking
        micro_slug: validationResult.data.microSlug,
        catalogue_version_used: 1,
        locale: currentLanguage,
        origin: 'web' as const,
        // Structured answers (sanitized)
        micro_q_answers: validationResult.data.microAnswers || {},
        general_answers: validationResult.data.generalAnswers || {},
        // Additional fields
        selected_items: validationResult.data.selectedItems || [],
        total_estimated_price: validationResult.data.totalEstimate || 0,
        location_details: validationResult.data.location || '',
        status: 'draft' as const
      };

      // Validate booking insert
      const insertValidation = safeValidateBookingInsert(bookingData);
      if (!insertValidation.success) {
        console.error('Insert validation failed:', insertValidation.error.issues);
        toast.error('Failed to prepare job data');
        return;
      }

      // Create the booking with complete audit trail
      const { data, error } = await supabase
        .from('bookings')
        .insert([insertValidation.data])
        .select()
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error('Failed to create job - no data returned');
        return;
      }

      toast.success('Job created successfully!');
      setShowWizard(false);
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job. Please try again.');
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-hero rounded-xl p-8 text-white">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-display font-bold mb-4">
            Get Your Project Done Right
          </h2>
          <p className="text-white/90 text-lg mb-6">
            Our AI-powered wizard helps you create detailed job posts that attract the best professionals. 
            Get accurate estimates and find the perfect match for your project.
          </p>
          <div className="flex gap-4">
            <Button 
              size="lg"
              className="bg-white text-charcoal hover:bg-white/90"
              onClick={() => setShowWizard(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Start New Project
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              <FileText className="w-5 h-5 mr-2" />
              Use Template
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-luxury">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Response Time</p>
                <p className="text-2xl font-bold text-charcoal">24h</p>
              </div>
              <Clock className="w-8 h-8 text-copper" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-luxury">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-charcoal">94%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-copper" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-luxury">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Pros</p>
                <p className="text-2xl font-bold text-charcoal">1,247</p>
              </div>
              <Users className="w-8 h-8 text-copper" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-luxury">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Quotes</p>
                <p className="text-2xl font-bold text-charcoal">5.2</p>
              </div>
              <Target className="w-8 h-8 text-copper" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* How It Works */}
        <Card className="card-luxury">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-copper" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold text-sm">
                1
              </div>
              <div>
                <h4 className="font-medium text-charcoal">Describe Your Project</h4>
                <p className="text-sm text-muted-foreground">
                  Use our AI wizard to create a detailed job description with accurate pricing
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold text-sm">
                2
              </div>
              <div>
                <h4 className="font-medium text-charcoal">Get Quality Quotes</h4>
                <p className="text-sm text-muted-foreground">
                  Receive detailed quotes from verified professionals in 24-48 hours
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold text-sm">
                3
              </div>
              <div>
                <h4 className="font-medium text-charcoal">Hire & Collaborate</h4>
                <p className="text-sm text-muted-foreground">
                  Compare, chat, and hire. Track progress with built-in project management
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Features */}
        <Card className="card-luxury border-copper/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-copper" />
              AI-Powered Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-copper/5 rounded-lg border-l-2 border-copper">
              <h4 className="font-medium text-charcoal text-sm">Smart Scope Builder</h4>
              <p className="text-xs text-muted-foreground">
                AI analyzes your project and suggests missing details for better quotes
              </p>
            </div>

            <div className="p-3 bg-copper/5 rounded-lg border-l-2 border-copper">
              <h4 className="font-medium text-charcoal text-sm">Price Intelligence</h4>
              <p className="text-xs text-muted-foreground">
                Get real-time market pricing with confidence indicators
              </p>
            </div>

            <div className="p-3 bg-copper/5 rounded-lg border-l-2 border-copper">
              <h4 className="font-medium text-charcoal text-sm">Pro Matching</h4>
              <p className="text-xs text-muted-foreground">
                AI matches you with the best professionals for your specific needs
              </p>
            </div>

            <div className="p-3 bg-copper/5 rounded-lg border-l-2 border-copper">
              <h4 className="font-medium text-charcoal text-sm">Quote Analysis</h4>
              <p className="text-xs text-muted-foreground">
                Compare quotes intelligently with risk assessment and recommendations
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="card-luxury">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start bg-gradient-hero hover:bg-copper text-white"
              onClick={() => setShowWizard(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Project
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start border-copper text-copper hover:bg-copper/5"
            >
              <FileText className="w-4 h-4 mr-2" />
              Browse Templates
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start"
            >
              <Clock className="w-4 h-4 mr-2" />
              Continue Draft
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start"
            >
              <Target className="w-4 h-4 mr-2" />
              Copy Previous Job
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tips Section */}
      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-copper" />
            Pro Tips for Better Results
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-charcoal mb-2">Be Specific</h4>
              <p className="text-sm text-muted-foreground">
                Include details like room dimensions, material preferences, and timeline. 
                More details = better quotes.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-charcoal mb-2">Upload Photos</h4>
              <p className="text-sm text-muted-foreground">
                Visual context helps professionals understand your project better and provide accurate estimates.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-charcoal mb-2">Set Realistic Budget</h4>
              <p className="text-sm text-muted-foreground">
                Our AI provides market-based estimates. Setting a realistic budget attracts quality professionals.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-charcoal mb-2">Flexible Timeline</h4>
              <p className="text-sm text-muted-foreground">
                Professionals often offer better rates for flexible scheduling. Consider off-peak periods.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostJobView;