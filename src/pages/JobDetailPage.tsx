import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useApplicantTracking } from '@/hooks/useApplicantTracking';
import { useEscrowRelease } from '@/hooks/useEscrowRelease';
import { Upload, FileText, Download, MessageSquare, User, Star, Clock, MapPin, DollarSign, Calendar, CheckCircle, XCircle, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  budget_type: string;
  budget_value: number;
  location: any;
  created_at: string;
  updated_at: string;
  micro_id: string;
  client_id: string;
  answers: any;
}

interface LifecycleEvent {
  id: string;
  event_type: string;
  from_status: string | null;
  to_status: string | null;
  created_at: string;
  metadata: any;
}

interface ClientFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [lifecycleEvents, setLifecycleEvents] = useState<LifecycleEvent[]>([]);
  const [clientFiles, setClientFiles] = useState<ClientFile[]>([]);
  const [escrowMilestones, setEscrowMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const { applicants, loading: applicantsLoading, updateApplicantStatus } = useApplicantTracking(id);
  const { releaseMilestone, isReleasing } = useEscrowRelease();

  useEffect(() => {
    if (!id) return;
    fetchJobData();
    fetchLifecycleEvents();
    fetchClientFiles();
    fetchEscrowMilestones();
  }, [id]);

  const fetchJobData = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Verify user owns this job
      if (data.client_id !== user?.id) {
        toast.error('You do not have access to this job');
        navigate('/dashboard');
        return;
      }

      setJob(data);
    } catch (error: any) {
      console.error('Error fetching job:', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const fetchLifecycleEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('job_lifecycle_events')
        .select('*')
        .eq('job_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLifecycleEvents(data || []);
    } catch (error: any) {
      console.error('Error fetching lifecycle events:', error);
    }
  };

  const fetchClientFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('client_files')
        .select('*')
        .eq('job_id', id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setClientFiles(data || []);
    } catch (error: any) {
      console.error('Error fetching files:', error);
    }
  };

  const fetchEscrowMilestones = async () => {
    try {
      // Get contract for this job
      const { data: contract, error: contractError } = await supabase
        .from('contracts')
        .select('id')
        .eq('job_id', id)
        .maybeSingle();

      if (contractError) throw contractError;
      
      if (contract) {
        const { data, error } = await supabase
          .from('escrow_milestones')
          .select('*')
          .eq('contract_id', contract.id)
          .order('milestone_number', { ascending: true });

        if (error) throw error;
        setEscrowMilestones(data || []);
      }
    } catch (error: any) {
      console.error('Error fetching escrow milestones:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !id) return;

    setUploading(true);
    try {
      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(fileName);

      // Save file record
      const { error: dbError } = await supabase
        .from('client_files')
        .insert({
          job_id: id,
          client_id: user?.id,
          file_name: file.name,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
        });

      if (dbError) throw dbError;

      toast.success('File uploaded successfully');
      fetchClientFiles();
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleMessageApplicant = (professionalId: string) => {
    navigate(`/messages?professional=${professionalId}`);
  };

  const handleAcceptApplicant = async (applicantId: string) => {
    try {
      await updateApplicantStatus(applicantId, 'accepted');
      toast.success('Applicant accepted!');
    } catch (error) {
      toast.error('Failed to accept applicant');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-blue-500/10 text-blue-700 border-blue-200',
      in_progress: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
      completed: 'bg-green-500/10 text-green-700 border-green-200',
      cancelled: 'bg-red-500/10 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-500/10 text-gray-700 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-copper"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-charcoal mb-2">Job not found</h2>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'My Jobs', href: '/dashboard' },
    { label: job.title },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <Breadcrumbs items={breadcrumbs} />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-charcoal mb-2">{job.title}</h1>
            <p className="text-muted-foreground">{job.description}</p>
          </div>
          <Badge className={cn('text-sm', getStatusColor(job.status))}>
            {job.status}
          </Badge>
        </div>

        {/* Job Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-copper" />
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="font-semibold text-charcoal">
                  ${job.budget_value} {job.budget_type === 'hourly' ? '/hr' : 'fixed'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-copper" />
              <div>
                <p className="text-sm text-muted-foreground">Posted</p>
                <p className="font-semibold text-charcoal">
                  {new Date(job.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <User className="w-8 h-8 text-copper" />
              <div>
                <p className="text-sm text-muted-foreground">Applicants</p>
                <p className="font-semibold text-charcoal">{applicants.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="applicants" className="space-y-6">
          <TabsList>
            <TabsTrigger value="applicants">Applicants ({applicants.length})</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="files">Files ({clientFiles.length})</TabsTrigger>
            <TabsTrigger value="details">Job Details</TabsTrigger>
          </TabsList>

          {/* Applicants Tab */}
          <TabsContent value="applicants" className="space-y-4">
            {applicantsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-copper mx-auto"></div>
              </div>
            ) : applicants.length > 0 ? (
              applicants.map((applicant) => (
                <Card key={applicant.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={applicant.professional?.avatar_url || ''} />
                        <AvatarFallback>
                          {applicant.professional?.full_name?.charAt(0) || 'P'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-charcoal text-lg">
                              {applicant.professional?.full_name || 'Professional'}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{applicant.status}</Badge>
                              <Badge variant="secondary">{applicant.availability_status}</Badge>
                              {applicant.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm">{applicant.rating}/5</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/professional/${applicant.professional_id}`)}
                            >
                              <User className="w-4 h-4 mr-2" />
                              View Profile
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMessageApplicant(applicant.professional_id)}
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Message
                            </Button>
                            {applicant.status === 'applied' && (
                              <Button
                                size="sm"
                                className="bg-gradient-hero text-white"
                                onClick={() => handleAcceptApplicant(applicant.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Accept
                              </Button>
                            )}
                          </div>
                        </div>

                        {applicant.notes && (
                          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">{applicant.notes}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Applied {new Date(applicant.applied_at).toLocaleDateString()}
                          </span>
                          {applicant.interview_scheduled_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Interview: {new Date(applicant.interview_scheduled_at).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <User className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-charcoal mb-2">No applicants yet</h3>
                  <p className="text-muted-foreground">
                    Professionals will see your job and can apply to work with you
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-copper" />
                      Escrow Milestones
                    </CardTitle>
                    <CardDescription>Track and release payments for project milestones</CardDescription>
                  </div>
                  <Button onClick={() => navigate('/payments')}>
                    View All Payments
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {escrowMilestones.length > 0 ? (
                  <div className="space-y-4">
                    {escrowMilestones.map((milestone) => (
                      <Card key={milestone.id} className="border-l-4 border-l-copper">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge variant="secondary">Milestone {milestone.milestone_number}</Badge>
                                <Badge className={cn(
                                  milestone.status === 'completed' && 'bg-green-500',
                                  milestone.status === 'pending' && 'bg-orange-500'
                                )}>
                                  {milestone.status}
                                </Badge>
                              </div>
                              <h4 className="font-semibold text-charcoal mb-1">{milestone.title}</h4>
                              <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <DollarSign className="w-4 h-4" />
                                  ${milestone.amount.toFixed(2)}
                                </span>
                                {milestone.due_date && (
                                  <span className="flex items-center gap-1 text-muted-foreground">
                                    <Calendar className="w-4 h-4" />
                                    Due: {new Date(milestone.due_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            {milestone.status === 'pending' && (
                              <Button
                                onClick={() => releaseMilestone({ milestoneId: milestone.id })}
                                disabled={isReleasing}
                                className="ml-4"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Release Funds
                              </Button>
                            )}
                            {milestone.status === 'completed' && milestone.completed_date && (
                              <div className="text-sm text-muted-foreground ml-4">
                                Released: {new Date(milestone.completed_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Shield className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-charcoal mb-2">No payment milestones</h3>
                    <p className="text-muted-foreground mb-4">
                      Payment milestones will appear here once a contract is established
                    </p>
                    <Button onClick={() => navigate('/payments')}>
                      Manage Payments
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4">
            {lifecycleEvents.length > 0 ? (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                {lifecycleEvents.map((event, index) => (
                  <div key={event.id} className="relative flex gap-4 pb-8">
                    <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-background border-2 border-copper rounded-full">
                      {event.event_type === 'status_change' ? (
                        event.to_status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 text-copper" />
                        ) : (
                          <Clock className="w-4 h-4 text-copper" />
                        )
                      ) : (
                        <Calendar className="w-4 h-4 text-copper" />
                      )}
                    </div>
                    <Card className="flex-1">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-charcoal capitalize">
                            {event.event_type.replace('_', ' ')}
                          </h4>
                          <span className="text-sm text-muted-foreground">
                            {new Date(event.created_at).toLocaleString()}
                          </span>
                        </div>
                        {event.from_status && event.to_status && (
                          <p className="text-sm text-muted-foreground">
                            Status changed from <Badge variant="outline">{event.from_status}</Badge> to{' '}
                            <Badge variant="outline">{event.to_status}</Badge>
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-charcoal mb-2">No activity yet</h3>
                  <p className="text-muted-foreground">Timeline events will appear here as your job progresses</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload Files</CardTitle>
                <CardDescription>Add documents, images, or other files related to this job</CardDescription>
              </CardHeader>
              <CardContent>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
              </CardContent>
            </Card>

            {clientFiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clientFiles.map((file) => (
                  <Card key={file.id}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <FileText className="w-10 h-10 text-copper" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-charcoal truncate">{file.file_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.file_size / 1024).toFixed(1)} KB •{' '}
                          {new Date(file.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(file.file_url, '_blank')}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-charcoal mb-2">No files uploaded</h3>
                  <p className="text-muted-foreground">Upload files to share with professionals</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Job Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-charcoal mb-2">Description</h4>
                  <p className="text-muted-foreground">{job.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-charcoal mb-2">Budget Type</h4>
                    <Badge>{job.budget_type}</Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold text-charcoal mb-2">Budget Amount</h4>
                    <p className="text-muted-foreground">${job.budget_value}</p>
                  </div>
                </div>

                {job.location && (
                  <div>
                    <h4 className="font-semibold text-charcoal mb-2">Location</h4>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location.address || 'Remote'}</span>
                    </div>
                  </div>
                )}

                {job.answers && Object.keys(job.answers).length > 0 && (
                  <div>
                    <h4 className="font-semibold text-charcoal mb-2">Additional Details</h4>
                    <div className="space-y-2">
                      {Object.entries(job.answers).map(([key, value]) => (
                        <div key={key} className="flex gap-2">
                          <span className="text-sm font-medium text-charcoal">{key}:</span>
                          <span className="text-sm text-muted-foreground">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
