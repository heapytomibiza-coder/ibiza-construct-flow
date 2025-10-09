import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Bell, Users, Eye } from 'lucide-react';

export default function PostJobSuccessPage() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-2xl w-full p-8">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600 dark:text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Job Posted Successfully!</h1>
          <p className="text-muted-foreground">
            Your job is now live on the job board
          </p>
        </div>
        
        {/* Distribution Info */}
        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <Bell className="w-5 h-5 text-green-600 dark:text-green-500 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">Pro & Premium Professionals Notified</h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Professionals with Pro and Premium subscriptions have received instant push notifications about your job.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <Eye className="w-5 h-5 text-blue-600 dark:text-blue-500 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Visible to All Professionals</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your job is visible to all professionals on the job board, including Basic tier members who check manually.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <Users className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">What Happens Next?</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Professionals will review your job and send quotes. You'll receive notifications when quotes arrive. Typical response time: 24-48 hours.
              </p>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3 justify-center flex-wrap">
          <Button 
            onClick={() => navigate(`/job-board${jobId ? `?highlight=${jobId}` : ''}`)}
            size="lg"
            className="bg-gradient-hero text-white"
          >
            View on Job Board
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard/client')}
            size="lg"
          >
            Go to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
