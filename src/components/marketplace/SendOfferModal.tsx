import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Euro, Clock, MapPin, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { offers } from '@/lib/api/offers';

interface SendOfferModalProps {
  jobId: string;
  onClose: () => void;
  onOfferSent: () => void;
}

export const SendOfferModal: React.FC<SendOfferModalProps> = ({
  jobId,
  onClose,
  onOfferSent
}) => {
  const { user } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'fixed' as 'fixed' | 'hourly',
    message: '',
    estimatedDuration: ''
  });

  useEffect(() => {
    loadJobDetails();
  }, [jobId]);

  const loadJobDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;

      // Get client profile separately
      let clientProfile = null;
      if (data.client_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', data.client_id)
          .single();
        
        clientProfile = profile;
      }

      setJob({
        ...data,
        client: {
          name: clientProfile?.full_name || 'Anonymous Client',
          avatar: clientProfile?.avatar_url
        }
      });

      // Pre-fill suggested amount based on job budget
      if (data.budget_value) {
        setFormData(prev => ({
          ...prev,
          amount: data.budget_value.toString(),
          type: (data.budget_type as 'fixed' | 'hourly') || 'fixed'
        }));
      }
    } catch (error: any) {
      toast.error('Failed to load job details: ' + error.message);
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to send an offer');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await offers.sendOffer(
        jobId,
        parseFloat(formData.amount),
        formData.type,
        formData.message
      );

      if (error) throw new Error(error);

      toast.success('Offer sent successfully!');
      onOfferSent();
    } catch (error: any) {
      toast.error('Failed to send offer: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!job) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Offer</DialogTitle>
          <DialogDescription>
            Send your offer for this job opportunity
          </DialogDescription>
        </DialogHeader>

        {/* Job Summary */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{job.client.name}</span>
                  </div>
                  
                  {job.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location.area}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <Badge variant="outline" className="capitalize">
                {job.status}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {job.description}
            </p>
            
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Client Budget</p>
                <p className="font-semibold text-primary">
                  €{job.budget_value}
                  {job.budget_type === 'hourly' && '/hr'}
                </p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="font-medium capitalize">{job.budget_type}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Offer Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Your Offer Amount</Label>
              <div className="relative">
                <Euro className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="type">Pricing Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'fixed' | 'hourly') => 
                  setFormData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                  <SelectItem value="hourly">Hourly Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.type === 'hourly' && (
            <div>
              <Label htmlFor="duration">Estimated Duration</Label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="duration"
                  placeholder="e.g., 5 hours, 2 days, 1 week"
                  value={formData.estimatedDuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="message">Message to Client</Label>
            <Textarea
              id="message"
              placeholder="Explain why you're the best fit for this job, your approach, timeline, and any questions..."
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              A personalized message increases your chances of being selected
            </p>
          </div>

          {/* Offer Summary */}
          <Card className="bg-gradient-hero/5 border-copper/20">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Offer Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-medium">
                    €{formData.amount || '0.00'}
                    {formData.type === 'hourly' && '/hour'}
                  </span>
                </div>
                {formData.estimatedDuration && (
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{formData.estimatedDuration}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="capitalize">{formData.type} price</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-hero text-white"
              disabled={loading || !formData.amount}
            >
              {loading ? 'Sending...' : 'Send Offer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};