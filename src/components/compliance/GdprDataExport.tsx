import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export function GdprDataExport() {
  const [isExporting, setIsExporting] = useState(false);
  const { user } = useAuth();

  const handleExport = async () => {
    if (!user) return;

    setIsExporting(true);

    try {
      // Fetch all user data from various tables
      const [profileData, jobsData, applicationsData, messagesData] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        (supabase as any).from('jobs').select('*').eq('client_id', user.id),
        (supabase as any).from('applications').select('*').eq('professional_id', user.id),
        (supabase as any).from('messages').select('*').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      ]);

      const userData = {
        profile: profileData.data,
        jobs: jobsData.data || [],
        applications: applicationsData.data || [],
        messages: messagesData.data || [],
        exportedAt: new Date().toISOString(),
        userId: user.id,
        email: user.email
      };

      // Create JSON file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      // Download file
      const link = document.createElement('a');
      link.href = url;
      link.download = `my-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Your data has been exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Your Data</CardTitle>
        <CardDescription>
          Download a copy of all your personal data in JSON format (GDPR compliance)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleExport} 
          disabled={isExporting}
          className="w-full"
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export My Data
            </>
          )}
        </Button>
        <p className="mt-4 text-sm text-muted-foreground">
          This export includes your profile information, jobs, applications, and messages.
          The file will be downloaded to your device.
        </p>
      </CardContent>
    </Card>
  );
}
