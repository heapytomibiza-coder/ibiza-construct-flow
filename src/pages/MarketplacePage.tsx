import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JobsMarketplace } from '@/components/marketplace/JobsMarketplace';
import { ProfessionalFinderFlow } from '@/components/marketplace/ProfessionalFinderFlow';
import { useAuth } from '@/hooks/useAuth';
import { Briefcase, Users } from 'lucide-react';

export default function MarketplacePage() {
  const { profile } = useAuth();
  
  const isProfessional = profile?.roles?.includes('professional');
  const isClient = profile?.roles?.includes('client');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Marketplace
          </h1>
          <p className="text-muted-foreground">
            {isProfessional && "Find jobs and grow your business"}
            {isClient && "Find trusted professionals for your projects"}
            {!isProfessional && !isClient && "Connect with jobs and professionals"}
          </p>
        </div>

        <Tabs defaultValue={isProfessional ? "jobs" : "professionals"} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Browse Jobs
            </TabsTrigger>
            <TabsTrigger value="professionals" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Find Professionals
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="jobs" className="mt-6">
            <JobsMarketplace />
          </TabsContent>
          
          <TabsContent value="professionals" className="mt-6">
            <ProfessionalFinderFlow />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}