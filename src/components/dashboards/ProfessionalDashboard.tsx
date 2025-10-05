import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist';
import { VerificationStatusCard } from '@/components/professional/VerificationStatusCard';
import { 
  LogOut, Briefcase, Star, MapPin, DollarSign, 
  Clock, CheckCircle, TrendingUp, Bell, Plus, 
  Settings, FileText, Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { ServiceCreationForm } from '@/components/services/ServiceCreationForm';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { BookingResponseModal } from '@/components/booking/BookingResponseModal';

const ProfessionalDashboard = ({ user, profile }: any) => {
  const [applications, setApplications] = useState([]);
  const [jobMatches, setJobMatches] = useState([]);
  const [serviceItems, setServiceItems] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedBookingRequest, setSelectedBookingRequest] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [stats, setStats] = useState({
    activeJobs: 0,
    applications: 0,
    rating: 0,
    earnings: 0,
    services: 0,
    verificationStatus: 'pending'
  });
  const [loading, setLoading] = useState(true);
  const { signOut } = useAuth();

  useEffect(() => {
    fetchProfessionalData();
  }, [user]);

  const fetchProfessionalData = async () => {
    if (!user) return;
    
    try {
      // Fetch applications
      const { data: applicationsData, error: appsError } = await supabase
        .from('professional_applications')
        .select(`
          *,
          bookings:booking_id (
            title,
            description,
            budget_range,
            services:service_id (category, subcategory, micro)
          )
        `)
        .eq('professional_id', user.id)
        .order('created_at', { ascending: false });

      if (appsError) throw appsError;

      // Fetch job matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('job_matches')
        .select(`
          *,
          bookings:booking_id (
            title,
            description,
            budget_range,
            client_id,
            services:service_id (category, subcategory, micro)
          )
        `)
        .eq('professional_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (matchesError) throw matchesError;

      // Fetch service items
      const { data: servicesData, error: servicesError } = await supabase
        .from('professional_service_items')
        .select('*')
        .eq('professional_id', user.id)
        .order('created_at', { ascending: false });

      if (servicesError) throw servicesError;

      // Fetch documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('professional_documents')
        .select('*')
        .eq('professional_id', user.id);

      if (documentsError) throw documentsError;

      setApplications(applicationsData || []);
      setJobMatches(matchesData || []);
      setServiceItems(servicesData || []);
      setDocuments(documentsData || []);

      // Calculate stats
      const activeApps = (applicationsData || []).length;
      const approvedDocs = (documentsData || []).filter(doc => doc.verification_status === 'approved').length;
      const totalDocs = (documentsData || []).length;
      
      let verificationStatus = 'none';
      if (totalDocs === 0) verificationStatus = 'none';
      else if (approvedDocs === totalDocs) verificationStatus = 'approved';
      else if (approvedDocs > 0) verificationStatus = 'partial';
      else verificationStatus = 'pending';

      setStats({
        activeJobs: activeApps,
        applications: (applicationsData || []).length,
        rating: 4.8, // TODO: Calculate from actual reviews
        earnings: 0, // TODO: Calculate from completed jobs
        services: (servicesData || []).length,
        verificationStatus
      });

    } catch (error) {
      console.error('Error fetching professional data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-copper"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Professional Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {profile.full_name || user.email}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">Professional</Badge>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-border">
          <Button
            variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Dashboard
          </Button>
          <Button
            variant={activeTab === 'services' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('services')}
            className="flex items-center gap-2"
          >
            <Briefcase className="w-4 h-4" />
            My Services ({stats.services})
          </Button>
          <Button
            variant={activeTab === 'documents' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('documents')}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Documents
          </Button>
          <Button
            variant={activeTab === 'create-service' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('create-service')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Service
          </Button>
        </div>

        {activeTab === 'dashboard' && (
          <>
            {/* Onboarding Checklist */}
            <OnboardingChecklist />
            
            {/* Verification Status */}
            <VerificationStatusCard userId={user.id} />
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                  <Briefcase className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeJobs}</div>
                  <p className="text-xs text-muted-foreground">Currently working</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Applications</CardTitle>
                  <MapPin className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.applications}</div>
                  <p className="text-xs text-muted-foreground">Total submitted</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Services</CardTitle>
                  <Settings className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.services}</div>
                  <p className="text-xs text-muted-foreground">Listed services</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rating</CardTitle>
                  <Star className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.rating}</div>
                  <p className="text-xs text-muted-foreground">Average rating</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Verification</CardTitle>
                  <CheckCircle className={`h-4 w-4 ${stats.verificationStatus === 'approved' ? 'text-green-600' : 'text-yellow-600'}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-bold capitalize">{stats.verificationStatus}</div>
                  <p className="text-xs text-muted-foreground">Document status</p>
                </CardContent>
              </Card>
            </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Job Opportunities
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Bell className="w-3 h-3" />
                  {jobMatches.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jobMatches.length > 0 ? (
                <div className="space-y-4">
                  {jobMatches.slice(0, 3).map((match: any) => (
                    <div key={match.id} className="p-4 border border-sand-dark/20 rounded-lg hover:border-copper/30 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-charcoal mb-1">
                            {match.bookings?.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {match.bookings?.services?.category} • {match.bookings?.services?.micro}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {match.status}
                            </Badge>
                            {match.bookings?.budget_range && (
                              <span className="text-sm font-medium text-copper">
                                {match.bookings.budget_range}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-gradient-hero hover:bg-copper"
                            onClick={() => {
                              setSelectedBookingRequest(match.bookings);
                              setIsBookingModalOpen(true);
                            }}
                          >
                            Respond
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No opportunities yet</h3>
                  <p className="mb-4">Job opportunities will appear here when clients post matching work</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.slice(0, 3).map((app: any) => (
                    <div key={app.id} className="p-4 border border-sand-dark/20 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-charcoal mb-1">
                            {app.bookings?.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Applied {new Date(app.created_at).toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              Submitted
                            </Badge>
                            {app.proposed_price && (
                              <span className="text-sm text-copper">
                                €{app.proposed_price}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No applications yet</h3>
                  <p>Start applying to jobs to see them here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
          </>
        )}

        {activeTab === 'services' && (
          <Card>
            <CardHeader>
              <CardTitle>My Service Listings</CardTitle>
            </CardHeader>
            <CardContent>
              {serviceItems.length > 0 ? (
                <div className="space-y-4">
                  {serviceItems.map((service: any) => (
                    <div key={service.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{service.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {service.description}
                          </p>
                          <div className="flex items-center gap-4">
                            <Badge variant="outline">€{service.base_price}</Badge>
                            <Badge variant={service.is_active ? 'default' : 'secondary'}>
                              {service.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {service.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">
                            {service.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No services yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first service listing to start getting bookings</p>
                  <Button onClick={() => setActiveTab('create-service')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Service
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'documents' && (
          <DocumentUpload 
            professionalId={user.id}
            onDocumentsUpdate={fetchProfessionalData}
          />
        )}

        {activeTab === 'create-service' && (
          <ServiceCreationForm
            professionalId={user.id}
            onServiceCreated={() => {
              setActiveTab('services');
              fetchProfessionalData();
            }}
          />
        )}
      </main>

      {/* Booking Response Modal */}
      <BookingResponseModal
        open={isBookingModalOpen}
        onOpenChange={setIsBookingModalOpen}
        bookingRequest={selectedBookingRequest}
        onResponseSent={() => {
          setIsBookingModalOpen(false);
          fetchProfessionalData();
        }}
      />
    </div>
  );
};

export default ProfessionalDashboard;