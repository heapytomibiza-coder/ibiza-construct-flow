import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileCheck, Clock, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import { VerificationDetailModal } from '@/components/admin/VerificationDetailModal';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Verification {
  id: string;
  professional_id: string;
  verification_method: string;
  status: string;
  notes: string;
  reviewer_notes: string;
  submitted_at: string;
  reviewed_at: string;
  reviewed_by: string;
  expires_at: string;
  professional_profiles: {
    user_id: string;
    business_name: string;
    primary_trade: string;
    profiles: {
      full_name: string;
    };
  };
}

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [filteredVerifications, setFilteredVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadVerifications();
    
    // Real-time subscription
    const channel = supabase
      .channel('admin-verifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'professional_verifications'
        },
        () => {
          loadVerifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    filterVerifications();
  }, [verifications, statusFilter, methodFilter, searchQuery]);

  const loadVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from('professional_verifications')
        .select(`
          *,
          professional_profiles!inner(
            user_id,
            business_name,
            primary_trade,
            profiles!inner(
              full_name
            )
          )
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setVerifications(data || []);
    } catch (error) {
      console.error('Error loading verifications:', error);
      toast.error('Failed to load verifications');
    } finally {
      setLoading(false);
    }
  };

  const filterVerifications = () => {
    let filtered = [...verifications];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(v => v.status === statusFilter);
    }

    if (methodFilter !== 'all') {
      filtered = filtered.filter(v => v.verification_method === methodFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(v => 
        v.professional_profiles.profiles.full_name.toLowerCase().includes(query) ||
        v.professional_profiles.business_name?.toLowerCase().includes(query)
      );
    }

    setFilteredVerifications(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <FileCheck className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: 'outline',
      approved: 'default',
      rejected: 'destructive',
      expired: 'secondary'
    };
    return variants[status] || 'default';
  };

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      id_document: 'ID Document',
      business_license: 'Business License',
      certification: 'Certification',
      insurance: 'Insurance'
    };
    return labels[method] || method;
  };

  const pendingCount = verifications.filter(v => v.status === 'pending').length;
  const approvedThisWeek = verifications.filter(v => {
    if (v.status !== 'approved' || !v.reviewed_at) return false;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(v.reviewed_at) > weekAgo;
  }).length;

  if (loading) {
    return (
      <div className="container max-w-7xl py-8">
        <p className="text-muted-foreground">Loading verifications...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-8">
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: 'Admin', href: '/dashboard/admin' },
            { label: 'Verifications' }
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Professional Verifications</h1>
            <p className="text-muted-foreground mt-2">
              Review and approve professional verification requests
            </p>
          </div>
          <div className="flex gap-4">
            <Card className="px-4 py-2">
              <div className="text-sm text-muted-foreground">Pending</div>
              <div className="text-2xl font-bold">{pendingCount}</div>
            </Card>
            <Card className="px-4 py-2">
              <div className="text-sm text-muted-foreground">Approved This Week</div>
              <div className="text-2xl font-bold">{approvedThisWeek}</div>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or business..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <label className="text-sm font-medium mb-2 block">Method</label>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="id_document">ID Document</SelectItem>
                  <SelectItem value="business_license">Business License</SelectItem>
                  <SelectItem value="certification">Certification</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Verification List */}
        <div className="space-y-4">
          {filteredVerifications.length === 0 ? (
            <Card className="p-8 text-center">
              <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No verifications found</p>
            </Card>
          ) : (
            filteredVerifications.map((verification) => (
              <Card key={verification.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(verification.status)}
                      <h3 className="font-semibold text-lg">
                        {verification.professional_profiles.profiles.full_name}
                      </h3>
                      <Badge variant={getStatusBadge(verification.status)}>
                        {verification.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {verification.professional_profiles.business_name && (
                        <p>Business: {verification.professional_profiles.business_name}</p>
                      )}
                      <p>Trade: {verification.professional_profiles.primary_trade}</p>
                      <p>Method: {getMethodLabel(verification.verification_method)}</p>
                      <p>Submitted: {format(new Date(verification.submitted_at), 'PPp')}</p>
                      {verification.reviewed_at && (
                        <p>Reviewed: {format(new Date(verification.reviewed_at), 'PPp')}</p>
                      )}
                    </div>
                    {verification.notes && (
                      <div className="mt-3 p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium mb-1">Professional's Notes:</p>
                        <p className="text-sm text-muted-foreground">{verification.notes}</p>
                      </div>
                    )}
                  </div>
                  <Button onClick={() => setSelectedVerification(verification)}>
                    View Details
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {selectedVerification && (
        <VerificationDetailModal
          verification={selectedVerification}
          open={!!selectedVerification}
          onClose={() => setSelectedVerification(null)}
          onUpdate={loadVerifications}
        />
      )}
    </div>
  );
}
