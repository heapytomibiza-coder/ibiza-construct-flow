import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  Star, 
  DollarSign,
  Users,
  Clock,
  Package,
  Settings,
  CheckCircle,
  GitBranch,
  Upload
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useServicesRegistry, ServiceNode } from '@/contexts/ServicesRegistry';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface ServiceVersion {
  id: string;
  service_id: string;
  version: number;
  questions_json: any;
  approved_by: string | null;
  approved_at: string | null;
  status: 'draft' | 'approved' | 'published';
  created_at: string;
}

interface ServiceCatalogueItem {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  base_price: number;
  avg_completion_time: number;
  popularity_score: number;
  total_bookings: number;
  avg_rating: number;
  active_professionals: number;
  status: 'active' | 'inactive' | 'deprecated';
  published_version: number | null;
  draft_version: number | null;
  created_at: string;
  updated_at: string;
}

interface CatalogueStats {
  total_services: number;
  active_services: number;
  total_bookings: number;
  avg_rating: number;
  total_revenue: number;
  top_category: string;
}

export const ServiceCatalogue = () => {
  const { services, loading: registryLoading } = useServicesRegistry();
  const [stats, setStats] = useState<CatalogueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<ServiceNode | null>(null);
  const [versionDialog, setVersionDialog] = useState(false);
  const [versions, setVersions] = useState<ServiceVersion[]>([]);

  useEffect(() => {
    loadStats();
    setLoading(false);
  }, []);

  const loadServiceVersions = async (serviceId: string) => {
    try {
      const { data, error } = await supabase
        .from('micro_questions_snapshot')
        .select('*')
        .eq('micro_category_id', serviceId)
        .order('version', { ascending: false });

      if (error) throw error;
      
      const mappedVersions: ServiceVersion[] = (data || []).map(v => ({
        id: v.id,
        service_id: v.micro_category_id,
        version: v.version,
        questions_json: v.questions_json,
        approved_by: null,
        approved_at: null,
        status: 'published', // Existing snapshots are published
        created_at: v.created_at || new Date().toISOString()
      }));
      
      setVersions(mappedVersions);
    } catch (error) {
      console.error('Error loading versions:', error);
      toast.error('Failed to load service versions');
    }
  };

  const approveQuestions = async (versionId: string) => {
    try {
      // In a real implementation, this would update the version status
      toast.success('Questions approved successfully');
      if (selectedService) {
        await loadServiceVersions(selectedService.id);
      }
    } catch (error) {
      console.error('Error approving questions:', error);
      toast.error('Failed to approve questions');
    }
  };

  const publishVersion = async (versionId: string) => {
    try {
      // In a real implementation, this would publish the version to production
      toast.success('Version published successfully');
      if (selectedService) {
        await loadServiceVersions(selectedService.id);
      }
    } catch (error) {
      console.error('Error publishing version:', error);
      toast.error('Failed to publish version');
    }
  };

  const loadStats = async () => {
    try {
      // Mock stats data
      const mockStats: CatalogueStats = {
        total_services: 147,
        active_services: 132,
        total_bookings: 18947,
        avg_rating: 4.6,
        total_revenue: 2456780,
        top_category: 'Cleaning'
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'deprecated':
        return <Badge variant="destructive">Deprecated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const categories = [...new Set(services.map(service => service.category))];
  
  const filteredServices = services.filter(service => {
    const matchesSearch = service.micro.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.subcategory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleViewVersions = (service: ServiceNode) => {
    setSelectedService(service);
    loadServiceVersions(service.id);
    setVersionDialog(true);
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center">Loading Service Catalogue...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Service Catalogue</h2>
          <p className="text-muted-foreground">Manage service offerings and pricing</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Service Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Services</p>
                  <p className="text-2xl font-bold">{stats.total_services}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{stats.active_services}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold">{(stats.total_bookings / 1000).toFixed(1)}k</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                  <p className="text-2xl font-bold">{stats.avg_rating}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">${(stats.total_revenue / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Top Category</p>
                  <p className="text-2xl font-bold">{stats.top_category}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">All Services</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Categories</option>
              {categories.map((category: string) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-4">
            {filteredServices.map((service) => (
              <Card key={service.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{service.micro}</h3>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">{service.category} › {service.subcategory}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewVersions(service)}
                      >
                        <GitBranch className="w-4 h-4 mr-1" />
                        Versions
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categories.map((category: string) => {
                  const categoryServices = services.filter(s => s.category === category);
                  
                  return (
                    <Card key={category}>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{category}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Services:</span>
                            <span className="font-medium">{categoryServices.length}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Service pricing analytics and recommendations will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Service performance metrics and trends will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={versionDialog} onOpenChange={setVersionDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Service Versions: {selectedService?.micro}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {versions.map((version) => (
              <Card key={version.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4" />
                      <span className="font-semibold">Version {version.version}</span>
                      {version.status === 'published' && (
                        <Badge variant="default">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Published
                        </Badge>
                      )}
                      {version.status === 'approved' && (
                        <Badge variant="secondary">Approved</Badge>
                      )}
                      {version.status === 'draft' && (
                        <Badge variant="outline">Draft</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {version.status === 'draft' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => approveQuestions(version.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      )}
                      {version.status === 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => publishVersion(version.id)}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Publish
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(version.created_at).toLocaleString()}
                    </p>
                    {version.approved_at && (
                      <p className="text-sm text-muted-foreground">
                        Approved: {new Date(version.approved_at).toLocaleString()}
                      </p>
                    )}
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium">
                        View Questions JSON
                      </summary>
                      <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-x-auto">
                        {JSON.stringify(version.questions_json, null, 2)}
                      </pre>
                    </details>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};