import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  Settings, 
  ChevronRight,
  Folder,
  FileText,
  Globe,
  TestTube,
  GripVertical as Grip
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Service {
  id: string;
  category: string;
  subcategory: string;
  micro: string;
  created_at: string;
}

interface ServiceNode {
  id: string;
  name: string;
  type: 'category' | 'subcategory' | 'micro';
  children?: ServiceNode[];
  isActive?: boolean;
  parent?: string;
}

export default function ServiceCatalogue() {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceTree, setServiceTree] = useState<ServiceNode[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceNode | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    buildServiceTree();
  }, [services]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const { data: servicesData, error } = await supabase
        .from('services')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setServices(servicesData || []);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildServiceTree = () => {
    const tree: ServiceNode[] = [];
    const categoryMap = new Map<string, ServiceNode>();
    const subcategoryMap = new Map<string, ServiceNode>();

    services.forEach(service => {
      // Create or get category
      if (!categoryMap.has(service.category)) {
        const categoryNode: ServiceNode = {
          id: `cat_${service.category}`,
          name: service.category,
          type: 'category',
          children: [],
          isActive: true
        };
        categoryMap.set(service.category, categoryNode);
        tree.push(categoryNode);
      }

      const categoryNode = categoryMap.get(service.category)!;

      // Create or get subcategory
      const subcategoryKey = `${service.category}_${service.subcategory}`;
      if (!subcategoryMap.has(subcategoryKey)) {
        const subcategoryNode: ServiceNode = {
          id: `sub_${subcategoryKey}`,
          name: service.subcategory,
          type: 'subcategory',
          children: [],
          parent: service.category,
          isActive: true
        };
        subcategoryMap.set(subcategoryKey, subcategoryNode);
        categoryNode.children!.push(subcategoryNode);
      }

      const subcategoryNode = subcategoryMap.get(subcategoryKey)!;

      // Create micro service
      const microNode: ServiceNode = {
        id: service.id,
        name: service.micro,
        type: 'micro',
        parent: subcategoryKey,
        isActive: true
      };
      subcategoryNode.children!.push(microNode);
    });

    setServiceTree(tree);
  };

  const renderServiceTree = (nodes: ServiceNode[], level: number = 0) => {
    return nodes.map(node => (
      <div key={node.id} className={`ml-${level * 4}`}>
        <div 
          className={`
            flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors
            ${selectedService?.id === node.id ? 'bg-primary/10 border border-primary/20' : ''}
          `}
          onClick={() => setSelectedService(node)}
        >
          <div className="flex items-center gap-2 flex-1">
            <Grip className="h-4 w-4 text-muted-foreground" />
            
            {node.type === 'category' && <Folder className="h-4 w-4 text-blue-500" />}
            {node.type === 'subcategory' && <Folder className="h-4 w-4 text-green-500" />}
            {node.type === 'micro' && <FileText className="h-4 w-4 text-purple-500" />}
            
            <span className="font-medium">{node.name}</span>
            
            {node.children && node.children.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {node.children.length}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Switch checked={node.isActive} />
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {node.children && (
          <div className="ml-4 mt-1">
            {renderServiceTree(node.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const ServiceEditor = () => {
    if (!selectedService) return null;

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {selectedService.type === 'category' && <Folder className="h-5 w-5 text-blue-500" />}
                {selectedService.type === 'subcategory' && <Folder className="h-5 w-5 text-green-500" />}
                {selectedService.type === 'micro' && <FileText className="h-5 w-5 text-purple-500" />}
                {selectedService.name}
                <Badge variant="outline" className="capitalize">
                  {selectedService.type}
                </Badge>
              </CardTitle>
              <CardDescription>
                Configure and manage this service
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" size="sm">
                <TestTube className="w-4 h-4 mr-2" />
                Test Flow
              </Button>
              <Button size="sm" onClick={() => setIsEditing(!isEditing)}>
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? 'Save' : 'Edit'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={selectedService.name}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Describe this service..."
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
          </div>

          {/* SEO Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <h4 className="font-medium">SEO Configuration</h4>
            </div>
            
            <div>
              <Label htmlFor="seo-title">SEO Title</Label>
              <Input 
                id="seo-title" 
                placeholder="SEO-optimized title..."
                disabled={!isEditing}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Recommended: 50-60 characters
              </p>
            </div>
            
            <div>
              <Label htmlFor="seo-desc">Meta Description</Label>
              <Textarea 
                id="seo-desc" 
                placeholder="SEO meta description..."
                disabled={!isEditing}
                className="mt-1"
                rows={2}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Recommended: 150-160 characters
              </p>
            </div>
            
            <div>
              <Label htmlFor="slug">URL Slug</Label>
              <Input 
                id="slug" 
                placeholder="url-friendly-slug"
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
          </div>

          {/* Visibility Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Visibility & Status</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">
                  Show this service to users
                </p>
              </div>
              <Switch checked={selectedService.isActive} disabled={!isEditing} />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Featured</Label>
                <p className="text-sm text-muted-foreground">
                  Highlight in featured services
                </p>
              </div>
              <Switch disabled={!isEditing} />
            </div>
          </div>

          {/* Question Configuration (for micro services) */}
          {selectedService.type === 'micro' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Question Flow</h4>
                <Button variant="outline" size="sm">
                  <TestTube className="w-4 h-4 mr-2" />
                  Test Questions
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  Question configuration will be loaded here. This includes micro-level questions and logistics questions.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Service Catalogue</h2>
          <p className="text-muted-foreground">
            Manage your three-tier service taxonomy: Categories → Subcategories → Micro-services
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <TestTube className="w-4 h-4 mr-2" />
            Bulk Test
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Service Tree */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Service Hierarchy</CardTitle>
                <Badge variant="secondary">{services.length} services</Badge>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading services...
                </div>
              ) : serviceTree.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No services found
                </div>
              ) : (
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {renderServiceTree(serviceTree)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Service Editor */}
        <div className="lg:col-span-3">
          {selectedService ? (
            <ServiceEditor />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-lg mb-2">Select a Service</h3>
                  <p className="text-muted-foreground">
                    Choose a service from the hierarchy to view and edit its configuration
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}