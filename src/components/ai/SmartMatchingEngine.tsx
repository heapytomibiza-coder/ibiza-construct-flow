import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Clock, 
  Star, 
  MapPin,
  DollarSign,
  Users,
  Zap,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MatchingCriteria {
  skill_match: number;
  location_proximity: number;
  availability_score: number;
  price_competitiveness: number;
  rating_weight: number;
  experience_factor: number;
}

interface ProfessionalMatch {
  professional_id: string;
  name: string;
  primary_trade: string;
  rating: number;
  distance_km: number;
  hourly_rate: number;
  match_score: number;
  confidence_level: 'high' | 'medium' | 'low';
  match_reasons: string[];
  availability_slots: string[];
  estimated_completion: string;
}

interface JobRequest {
  id: string;
  title: string;
  category: string;
  description: string;
  budget_range: string;
  location: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  required_skills: string[];
  preferred_date: string;
}

export const SmartMatchingEngine = () => {
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);
  const [matches, setMatches] = useState<ProfessionalMatch[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobRequest | null>(null);
  const [matchingCriteria, setMatchingCriteria] = useState<MatchingCriteria>({
    skill_match: 40,
    location_proximity: 25,
    availability_score: 15,
    price_competitiveness: 10,
    rating_weight: 5,
    experience_factor: 5
  });
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadJobRequests();
  }, []);

  const loadJobRequests = async () => {
    try {
      // Mock job requests - in real implementation, this would come from database
      const mockJobs: JobRequest[] = [
        {
          id: '1',
          title: 'Emergency Pipe Burst Repair',
          category: 'Plumbing',
          description: 'Urgent pipe burst in kitchen, water everywhere',
          budget_range: '$200-400',
          location: 'Downtown, City Center',
          urgency: 'emergency',
          required_skills: ['emergency_plumbing', 'pipe_repair', 'water_damage'],
          preferred_date: '2024-01-16T08:00:00Z'
        },
        {
          id: '2',
          title: 'Kitchen Cabinet Installation',
          category: 'Carpentry',
          description: 'Install new kitchen cabinets, 15 units total',
          budget_range: '$1000-1500',
          location: 'North District',
          urgency: 'medium',
          required_skills: ['cabinet_installation', 'carpentry', 'kitchen_remodel'],
          preferred_date: '2024-01-20T09:00:00Z'
        },
        {
          id: '3',
          title: 'Electrical Panel Upgrade',
          category: 'Electrical',
          description: 'Replace old electrical panel with modern 200A service',
          budget_range: '$800-1200',
          location: 'South Valley',
          urgency: 'high',
          required_skills: ['electrical_panel', 'electrical_upgrade', 'permits'],
          preferred_date: '2024-01-18T10:00:00Z'
        }
      ];

      setJobRequests(mockJobs);
    } catch (error) {
      console.error('Error loading job requests:', error);
      toast.error('Failed to load job requests');
    }
  };

  const runSmartMatching = async (jobId: string) => {
    setLoading(true);
    setIsProcessing(true);
    
    try {
      // Simulate AI matching process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock professional matches
      const mockMatches: ProfessionalMatch[] = [
        {
          professional_id: '1',
          name: 'John Smith',
          primary_trade: 'Plumbing',
          rating: 4.8,
          distance_km: 2.1,
          hourly_rate: 85,
          match_score: 94,
          confidence_level: 'high',
          match_reasons: [
            'Specialized in emergency plumbing',
            'Available within 30 minutes',
            'Excellent rating for similar jobs',
            'Competitive pricing'
          ],
          availability_slots: ['2024-01-16T08:00:00Z', '2024-01-16T09:00:00Z'],
          estimated_completion: '2024-01-16T12:00:00Z'
        },
        {
          professional_id: '2',
          name: 'Mike Johnson',
          primary_trade: 'Plumbing',
          rating: 4.6,
          distance_km: 5.3,
          hourly_rate: 75,
          match_score: 87,
          confidence_level: 'high',
          match_reasons: [
            'Water damage repair specialist',
            'Available today',
            'Lower rate than average',
            'Good customer reviews'
          ],
          availability_slots: ['2024-01-16T10:00:00Z', '2024-01-16T14:00:00Z'],
          estimated_completion: '2024-01-16T15:00:00Z'
        },
        {
          professional_id: '3',
          name: 'Sarah Williams',
          primary_trade: 'Plumbing',
          rating: 4.9,
          distance_km: 8.7,
          hourly_rate: 95,
          match_score: 82,
          confidence_level: 'medium',
          match_reasons: [
            'Highest rated professional',
            'Emergency service available',
            'Licensed and insured'
          ],
          availability_slots: ['2024-01-16T12:00:00Z'],
          estimated_completion: '2024-01-16T16:00:00Z'
        }
      ];

      setMatches(mockMatches);
      toast.success('Smart matching completed successfully');
    } catch (error) {
      console.error('Error running smart matching:', error);
      toast.error('Failed to run smart matching');
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return <Badge variant="destructive">Emergency</Badge>;
      case 'high':
        return <Badge variant="default" className="bg-orange-500">High</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{urgency}</Badge>;
    }
  };

  const getConfidenceBadge = (level: string) => {
    switch (level) {
      case 'high':
        return <Badge variant="default" className="bg-green-500">High Confidence</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium Confidence</Badge>;
      case 'low':
        return <Badge variant="outline">Low Confidence</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Smart Matching Engine</h2>
          <p className="text-muted-foreground">AI-powered professional matching and job assignment</p>
        </div>
        <div className="flex items-center space-x-2">
          {isProcessing && (
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 animate-pulse text-primary" />
              <span className="text-sm text-muted-foreground">AI Processing...</span>
            </div>
          )}
          <Button disabled={isProcessing}>
            <Target className="w-4 h-4 mr-2" />
            Optimize Matching
          </Button>
        </div>
      </div>

      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">Active Jobs</TabsTrigger>
          <TabsTrigger value="criteria">Matching Criteria</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Job Requests */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pending Job Requests</h3>
              {jobRequests.map((job) => (
                <Card key={job.id} className={`cursor-pointer transition-all ${
                  selectedJob?.id === job.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                }`} onClick={() => setSelectedJob(job)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{job.title}</h4>
                      {getUrgencyBadge(job.urgency)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{job.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-muted-foreground" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1 text-muted-foreground" />
                        <span>{job.budget_range}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-muted-foreground" />
                        <span>{new Date(job.preferred_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Button 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          runSmartMatching(job.id);
                        }}
                        disabled={loading}
                      >
                        <Brain className="w-4 h-4 mr-1" />
                        Find Matches
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Professional Matches */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Smart Matches</h3>
              {matches.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Select a job and run smart matching to see AI-powered professional recommendations</p>
                  </CardContent>
                </Card>
              ) : (
                matches.map((match) => (
                  <Card key={match.professional_id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{match.name}</h4>
                          <p className="text-sm text-muted-foreground">{match.primary_trade}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{match.match_score}%</div>
                          <div className="text-xs text-muted-foreground">Match Score</div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <Progress value={match.match_score} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-500" />
                          <span>{match.rating} rating</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1 text-muted-foreground" />
                          <span>{match.distance_km}km away</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1 text-muted-foreground" />
                          <span>${match.hourly_rate}/hr</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-muted-foreground" />
                          <span>Available now</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        {getConfidenceBadge(match.confidence_level)}
                      </div>

                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground mb-1">Match Reasons:</p>
                        <ul className="text-xs space-y-1">
                          {match.match_reasons.map((reason, index) => (
                            <li key={index} className="flex items-center">
                              <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" className="flex-1">
                          <Users className="w-4 h-4 mr-1" />
                          Assign
                        </Button>
                        <Button size="sm" variant="outline">
                          <Zap className="w-4 h-4 mr-1" />
                          Contact
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="criteria" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Matching Algorithm Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(matchingCriteria).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium capitalize">
                      {key.replace('_', ' ')}
                    </label>
                    <span className="text-sm text-muted-foreground">{value}%</span>
                  </div>
                  <Progress value={value} className="h-2" />
                </div>
              ))}
              <Button className="w-full mt-6">
                Update Matching Criteria
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Match Accuracy</p>
                    <p className="text-2xl font-bold">92.4%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Response Time</p>
                    <p className="text-2xl font-bold">1.2s</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Successful Matches</p>
                    <p className="text-2xl font-bold">1,847</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Improvement Rate</p>
                    <p className="text-2xl font-bold">+15.3%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};