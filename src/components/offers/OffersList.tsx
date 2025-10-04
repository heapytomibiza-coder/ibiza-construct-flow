import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, CheckCircle, X, MessageSquare, 
  Briefcase, Euro, Calendar, User
} from 'lucide-react';
import { OfferCard } from './OfferCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { 
  useGetOffersByTasker, 
  useListOffersForJob, 
  useAcceptOffer, 
  useDeclineOffer 
} from '../../../packages/@contracts/clients/offers';

export const OffersList: React.FC = () => {
  const { user } = useAuth();
  const [userJobs, setUserJobs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('sent');
  
  // Fetch offers sent by this user
  const { data: sentOffersData, isLoading: sentLoading } = useGetOffersByTasker(user?.id || '');
  
  // Fetch user's jobs to get received offers
  useEffect(() => {
    if (user) {
      supabase
        .from('jobs')
        .select('id')
        .eq('client_id', user.id)
        .then(({ data }) => {
          if (data) setUserJobs(data.map(job => job.id));
        });
    }
  }, [user]);
  
  const acceptOfferMutation = useAcceptOffer();
  const declineOfferMutation = useDeclineOffer();
  
  // Enrich sent offers with job details
  const [enrichedSentOffers, setEnrichedSentOffers] = useState<any[]>([]);
  
  useEffect(() => {
    if (sentOffersData?.data) {
      Promise.all(
        sentOffersData.data.map(async (offer) => {
          const { data: job } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', offer.jobId)
            .single();
          
          let clientProfile = null;
          if (job?.client_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', job.client_id)
              .single();
            clientProfile = profile;
          }
          
          return {
            ...offer,
            job,
            client: {
              name: clientProfile?.full_name || 'Anonymous Client',
              avatar: null
            }
          };
        })
      ).then(setEnrichedSentOffers);
    }
  }, [sentOffersData]);

  const handleAcceptOffer = (offerId: string) => {
    acceptOfferMutation.mutate(offerId, {
      onSuccess: () => {
        toast.success('Offer accepted successfully!');
      },
      onError: (error: any) => {
        toast.error('Failed to accept offer: ' + error.message);
      }
    });
  };

  const handleDeclineOffer = (offerId: string) => {
    declineOfferMutation.mutate(offerId, {
      onSuccess: () => {
        toast.success('Offer declined');
      },
      onError: (error: any) => {
        toast.error('Failed to decline offer: ' + error.message);
      }
    });
  };

  const handleMessage = (offerId: string) => {
    toast.info('Messaging feature coming soon');
  };

  if (sentLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-32"></div>
                  <div className="h-3 bg-muted rounded w-24"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const sentOffers = enrichedSentOffers;
  // For now, we'll handle received offers separately per job
  const receivedOffers: any[] = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            My Offers
          </h2>
          <p className="text-muted-foreground">
            Manage your sent and received offers
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Sent Offers ({sentOffers.length})
          </TabsTrigger>
          <TabsTrigger value="received" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Received Offers ({receivedOffers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sent" className="space-y-4">
          {sentOffers.length > 0 ? (
            <div className="space-y-4">
              {sentOffers.map((offer) => (
                <Card key={offer.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          {offer.job?.title || 'Job Title'}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{offer.client?.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Sent {new Date(offer.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Badge 
                        variant={
                          offer.status === 'accepted' ? 'default' : 
                          offer.status === 'declined' ? 'destructive' : 
                          'secondary'
                        }
                        className="capitalize"
                      >
                        {offer.status === 'sent' ? 'pending' : offer.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Offer Amount</p>
                        <p className="font-semibold text-primary text-lg">
                          €{offer.amount}
                          {offer.type === 'hourly' && '/hr'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="font-medium capitalize">{offer.type} price</p>
                      </div>
                    </div>

                    {offer.message && (
                      <div className="p-3 bg-muted rounded-lg mb-4">
                        <p className="text-sm text-muted-foreground mb-1">Your message:</p>
                        <p className="text-sm">{offer.message}</p>
                      </div>
                    )}

                    {offer.status === 'sent' && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit Offer
                        </Button>
                        <Button variant="ghost" size="sm">
                          Withdraw
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No offers sent yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start browsing jobs and send your first offer to get started.
                </p>
                <Button>Browse Jobs</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="received" className="space-y-4">
          {receivedOffers.length > 0 ? (
            <div className="space-y-4">
              {receivedOffers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  onAccept={() => handleAcceptOffer(offer.id)}
                  onDecline={() => handleDeclineOffer(offer.id)}
                  onMessage={() => handleMessage(offer.id)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No offers received yet</h3>
                <p className="text-muted-foreground mb-4">
                  Post a job to start receiving offers from professionals.
                </p>
                <Button>Post a Job</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};