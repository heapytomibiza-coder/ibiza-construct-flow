import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  FileText,
  MapPin,
  Star,
  Shield,
  DollarSign,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import PriceValidationBadge from '../PriceValidationBadge';

interface Professional {
  id: string;
  user_id: string;
  bio: string | null;
  verification_status: string;
  experience_years: number | null;
  hourly_rate: number | null;
  skills: string[] | null;
  languages: string[] | null;
  zones: string[] | null;
  created_at: string | null;
  updated_at: string | null;
  // Joined data
  full_name?: string;
  email?: string;
  profile_completion?: number;
  documents_count?: number;
  active_jobs?: number;
  rating_avg?: number;
}

interface Document {
  id: string;
  professional_id: string;
  document_type: string;
  file_name: string;
  verification_status: string;
  expires_at?: string;
  created_at: string;
}

export default function ProfessionalHub() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    suspended: 0,
    documents_pending: 0
  });

  useEffect(() => {
    loadProfessionals();
    loadDocuments();
  }, []);

  useEffect(() => {
    filterProfessionals();
  }, [professionals, searchTerm, statusFilter]);

  const loadProfessionals = async () => {
    setLoading(true);
    try {
      const { data: professionalsData, error } = await supabase
        .from('professional_profiles')
        .select(`
          *,
          profiles!user_id(full_name, roles)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get document counts separately
      const { data: documentData } = await supabase
        .from('professional_documents')
        .select('professional_id');
        
      const documentCounts = documentData ?
        Object.entries(
          documentData.reduce((acc: Record<string, number>, doc) => {
            acc[doc.professional_id] = (acc[doc.professional_id] || 0) + 1;
            return acc;
          }, {})
        ).map(([professional_id, count]) => ({ professional_id, count })) : [];

      const processedProfessionals = professionalsData?.map(prof => {
        const completionScore = calculateProfileCompletion(prof);
        const docCount = documentCounts?.find(dc => dc.professional_id === prof.user_id)?.count || 0;
        
        return {
          id: prof.user_id, // Use user_id as the id
          user_id: prof.user_id,
          bio: prof.bio,
          verification_status: prof.verification_status || 'unverified',
          experience_years: prof.experience_years,
          hourly_rate: prof.hourly_rate,
          skills: Array.isArray(prof.skills) ? prof.skills.map(skill => String(skill)) : [],
          languages: Array.isArray(prof.languages) ? prof.languages.map(lang => String(lang)) : [],
          zones: Array.isArray(prof.zones) ? prof.zones.map(zone => String(zone)) : [],
          created_at: prof.created_at,
          updated_at: prof.updated_at,
          full_name: prof.profiles?.full_name || 'Unknown',
          profile_completion: completionScore,
          documents_count: docCount,
          active_jobs: 0, // TODO: Add real count from contracts table
          rating_avg: 0 // TODO: Add real rating system
        };
      }) || [];

      setProfessionals(processedProfessionals);
      calculateStats(processedProfessionals);
    } catch (error) {
      console.error('Error loading professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const { data: documentsData, error } = await supabase
        .from('professional_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(documentsData || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const calculateProfileCompletion = (prof: any): number => {
    let score = 0;
    const maxScore = 100;
    
    if (prof.bio) score += 15;
    if (prof.experience_years) score += 10;
    if (prof.hourly_rate) score += 10;
    if (prof.skills && prof.skills.length > 0) score += 20;
    if (prof.languages && prof.languages.length > 0) score += 10;
    if (prof.zones && prof.zones.length > 0) score += 15;
    if (prof.portfolio_images && prof.portfolio_images.length > 0) score += 20;
    
    return Math.min(score, maxScore);
  };

  const calculateStats = (profData: Professional[]) => {
    const stats = profData.reduce((acc, prof) => {
      acc.total++;
      switch (prof.verification_status) {
        case 'pending':
          acc.pending++;
          break;
        case 'verified':
          acc.approved++;
          break;
        case 'suspended':
          acc.suspended++;
          break;
      }
      return acc;
    }, { total: 0, pending: 0, approved: 0, suspended: 0, documents_pending: 0 });

    // Count pending documents
    stats.documents_pending = documents.filter(doc => doc.verification_status === 'pending').length;
    
    setStats(stats);
  };

  const filterProfessionals = () => {
    let filtered = [...professionals];

    if (searchTerm) {
      filtered = filtered.filter(prof => 
        prof.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(prof => prof.verification_status === statusFilter);
    }

    setFilteredProfessionals(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: <Clock className="w-3 h-3" /> },
      verified: { variant: 'default' as const, icon: <CheckCircle className="w-3 h-3" /> },
      suspended: { variant: 'destructive' as const, icon: <XCircle className="w-3 h-3" /> },
      unverified: { variant: 'outline' as const, icon: <AlertTriangle className="w-3 h-3" /> }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleStatusChange = async (professionalId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('professional_profiles')
        .update({ verification_status: newStatus })
        .eq('user_id', professionalId);

      if (error) throw error;
      
      // Reload data
      loadProfessionals();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const OnboardingQueue = () => (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Suspended</p>
                <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Docs Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats.documents_pending}</p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Professionals Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Professional Applications</CardTitle>
              <CardDescription>Review and approve professional profiles</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search professionals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Approved</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Professional</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Completion</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading professionals...
                  </TableCell>
                </TableRow>
              ) : filteredProfessionals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No professionals found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProfessionals.map((prof) => (
                  <TableRow key={prof.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" />
                          <AvatarFallback>
                            {prof.full_name?.charAt(0) || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{prof.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {prof.skills?.slice(0, 2).join(', ')}
                            {prof.skills && prof.skills.length > 2 && '...'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(prof.verification_status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={prof.profile_completion} className="w-16" />
                        <span className="text-sm text-muted-foreground">
                          {prof.profile_completion}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {prof.experience_years ? `${prof.experience_years} years` : 'Not set'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {prof.hourly_rate ? `€${prof.hourly_rate}/hr` : 'Not set'}
                        </span>
                        {prof.hourly_rate && prof.hourly_rate > 0 && (
                          <PriceValidationBadge
                            serviceType="professional"
                            category="general"
                            subcategory="hourly"
                            currentPrice={prof.hourly_rate}
                            location="general"
                            professionalId={prof.id}
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {prof.documents_count || 0} docs
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(prof.created_at), 'MMM d, yyyy')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => setSelectedProfessional(prof)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Select onValueChange={(value) => handleStatusChange(prof.id, value)}>
                          <SelectTrigger className="w-24 h-8">
                            <SelectValue placeholder="Action" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="verified">
                              <div className="flex items-center gap-2">
                                <UserCheck className="h-3 w-3" />
                                Approve
                              </div>
                            </SelectItem>
                            <SelectItem value="suspended">
                              <div className="flex items-center gap-2">
                                <UserX className="h-3 w-3" />
                                Suspend
                              </div>
                            </SelectItem>
                            <SelectItem value="pending">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                Pending
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const DocumentReview = () => (
    <Card>
      <CardHeader>
        <CardTitle>Document Verification</CardTitle>
        <CardDescription>Review uploaded professional documents</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          Document review interface will be implemented here
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Professional Hub</h2>
          <p className="text-muted-foreground">
            Manage professional applications, approvals, and verification
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{stats.total} total professionals</Badge>
        </div>
      </div>

      <Tabs defaultValue="onboarding" className="space-y-6">
        <TabsList>
          <TabsTrigger value="onboarding">Onboarding Queue</TabsTrigger>
          <TabsTrigger value="documents">Document Review</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="onboarding">
          <OnboardingQueue />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentReview />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Professional Analytics</CardTitle>
              <CardDescription>Insights and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Analytics dashboard will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}