import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Star, 
  StarOff, 
  Trash2, 
  Eye, 
  Calendar,
  BarChart3,
  Filter,
  Plus,
  Download,
  Upload,
  Copy,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface JobTemplate {
  id: string;
  user_id: string;
  name: string;
  category: string;
  subcategory: string;
  micro_service: string;
  template_data: any;
  usage_count: number;
  is_favorite: boolean;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function Templates() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<JobTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<JobTemplate | null>(null);
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (!user) {
      navigate('/auth/sign-in');
      return;
    }
    loadTemplates();
  }, [user, navigate]);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('job_templates')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (templateId: string, currentFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from('job_templates')
        .update({ is_favorite: !currentFavorite })
        .eq('id', templateId);

      if (error) throw error;

      setTemplates(prev => prev.map(template =>
        template.id === templateId
          ? { ...template, is_favorite: !currentFavorite }
          : template
      ));

      toast.success(currentFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Error updating favorite status:', error);
      toast.error('Failed to update favorite status');
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('job_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      setTemplates(prev => prev.filter(template => template.id !== templateId));
      toast.success('Template deleted successfully');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
    setDeleteTemplateId(null);
  };

  const duplicateTemplate = async (template: JobTemplate) => {
    try {
      const { error } = await supabase
        .from('job_templates')
        .insert({
          user_id: user?.id,
          name: `${template.name} (Copy)`,
          category: template.category,
          subcategory: template.subcategory,
          micro_service: template.micro_service,
          template_data: template.template_data,
          usage_count: 0,
          is_favorite: false
        });

      if (error) throw error;

      await loadTemplates();
      toast.success('Template duplicated successfully');
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast.error('Failed to duplicate template');
    }
  };

  const useTemplate = async (template: JobTemplate) => {
    try {
      // Update usage count and last used date
      const { error } = await supabase
        .from('job_templates')
        .update({
          usage_count: template.usage_count + 1,
          last_used_at: new Date().toISOString()
        })
        .eq('id', template.id);

      if (error) throw error;

      // Navigate to PostJob with template data
      navigate('/post', { state: { templateData: template.template_data } });
    } catch (error) {
      console.error('Error using template:', error);
      toast.error('Failed to use template');
    }
  };

  const exportTemplates = () => {
    const exportData = {
      templates: templates.map(({ id, user_id, created_at, updated_at, ...template }) => template),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `job-templates-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Templates exported successfully');
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.micro_service.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categorizedTemplates = {
    favorites: filteredTemplates.filter(t => t.is_favorite),
    recent: filteredTemplates.filter(t => t.last_used_at && !t.is_favorite).slice(0, 10),
    all: filteredTemplates.filter(t => !t.is_favorite && (!t.last_used_at || !filteredTemplates.filter(r => r.last_used_at && !r.is_favorite).slice(0, 10).includes(t)))
  };

  const categories = [...new Set(templates.map(t => t.category))];

  const getTemplateStats = () => ({
    total: templates.length,
    favorites: templates.filter(t => t.is_favorite).length,
    totalUsage: templates.reduce((sum, t) => sum + t.usage_count, 0),
    mostUsed: templates.reduce((max, t) => t.usage_count > max.usage_count ? t : max, templates[0] || { usage_count: 0 })
  });

  const stats = getTemplateStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header jobWizardEnabled={true} />
        <main className="pt-20 container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading templates...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header jobWizardEnabled={true} />
      
      <main className="pt-20 container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-display text-2xl font-semibold text-charcoal mb-2">Job Templates</h1>
              <p className="text-muted-foreground">Manage and organize your job posting templates</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => navigate('/post')} className="bg-gradient-hero text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create New Job
              </Button>
              <Button variant="outline" onClick={exportTemplates}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Templates</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-amber-600">{stats.favorites}</div>
                <div className="text-sm text-muted-foreground">Favorites</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalUsage}</div>
                <div className="text-sm text-muted-foreground">Total Uses</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.mostUsed?.usage_count || 0}</div>
                <div className="text-sm text-muted-foreground">Most Used</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Templates Content */}
        <Tabs defaultValue="organized" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="organized">Organized View</TabsTrigger>
            <TabsTrigger value="all">All Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="organized" className="space-y-6">
            {/* Favorites */}
            {categorizedTemplates.favorites.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-charcoal mb-4 flex items-center">
                  <Star className="w-5 h-5 text-amber-500 mr-2" />
                  Favorites ({categorizedTemplates.favorites.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categorizedTemplates.favorites.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onToggleFavorite={toggleFavorite}
                      onDelete={setDeleteTemplateId}
                      onDuplicate={duplicateTemplate}
                      onUse={useTemplate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recently Used */}
            {categorizedTemplates.recent.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-charcoal mb-4 flex items-center">
                  <Calendar className="w-5 h-5 text-blue-500 mr-2" />
                  Recently Used ({categorizedTemplates.recent.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categorizedTemplates.recent.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onToggleFavorite={toggleFavorite}
                      onDelete={setDeleteTemplateId}
                      onDuplicate={duplicateTemplate}
                      onUse={useTemplate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Other Templates */}
            {categorizedTemplates.all.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-charcoal mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 text-primary mr-2" />
                  All Templates ({categorizedTemplates.all.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categorizedTemplates.all.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onToggleFavorite={toggleFavorite}
                      onDelete={setDeleteTemplateId}
                      onDuplicate={duplicateTemplate}
                      onUse={useTemplate}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onToggleFavorite={toggleFavorite}
                  onDelete={setDeleteTemplateId}
                  onDuplicate={duplicateTemplate}
                  onUse={useTemplate}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Empty State */}
        {templates.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-muted-foreground mb-4">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No templates yet</p>
                <p>Create your first job posting to start building your template library.</p>
              </div>
              <Button onClick={() => navigate('/post')} className="bg-gradient-hero text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Job
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteTemplateId} onOpenChange={() => setDeleteTemplateId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Template</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this template? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteTemplateId && deleteTemplate(deleteTemplateId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}

// Template Card Component
interface TemplateCardProps {
  template: JobTemplate;
  onToggleFavorite: (id: string, currentFavorite: boolean) => void;
  onDelete: (id: string) => void;
  onDuplicate: (template: JobTemplate) => void;
  onUse: (template: JobTemplate) => void;
}

function TemplateCard({ template, onToggleFavorite, onDelete, onDuplicate, onUse }: TemplateCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border border-border/50 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-charcoal truncate">
              {template.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {template.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {template.micro_service}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleFavorite(template.id, template.is_favorite)}
            className="p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {template.is_favorite ? (
              <Star className="w-4 h-4 text-amber-500 fill-current" />
            ) : (
              <StarOff className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Used {template.usage_count} times</span>
          {template.last_used_at && (
            <span>Last used {new Date(template.last_used_at).toLocaleDateString()}</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={() => onUse(template)} className="flex-1 bg-gradient-hero text-white">
            <Eye className="w-4 h-4 mr-2" />
            Use Template
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDuplicate(template)}
            className="p-2"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(template.id)}
            className="p-2 hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}