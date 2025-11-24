import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Plus, MapPin, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function RecentJobsSection() {
  const navigate = useNavigate();
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentJobs();
  }, []);

  const fetchRecentJobs = async () => {
    try {
      // Fetch recent job postings that match professional's profile
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services:service_id (
            category,
            subcategory,
            micro
          )
        `)
        .in('status', ['posted', 'matched'])
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecentJobs(data || []);
    } catch (error) {
      console.error('Error fetching recent jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-copper mx-auto"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Recent Job Opportunities
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/job-board')}
          >
            View All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentJobs.length > 0 ? (
          <div className="space-y-3">
            {recentJobs.map((job) => (
              <div 
                key={job.id} 
                className="flex items-center gap-3 p-3 bg-sand-light rounded-lg hover:bg-sand-light/80 transition-colors cursor-pointer"
                onClick={() => navigate(`/job-board/${job.id}`)}
              >
                <div className="w-10 h-10 bg-copper/10 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-copper" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">{job.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{job.services?.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Badge variant="outline">
                  {job.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Briefcase className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No recent jobs</h3>
            <p className="text-muted-foreground mb-4">New opportunities will appear here</p>
            <Button 
              className="bg-gradient-hero hover:bg-copper text-white"
              onClick={() => navigate('/job-board')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Browse All Jobs
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
