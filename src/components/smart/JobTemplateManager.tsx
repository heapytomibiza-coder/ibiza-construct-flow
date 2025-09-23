import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Bookmark, Clock, Star, Trash2, Plus, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface JobTemplate {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  micro_service: string;
  template_data: any;
  usage_count: number;
  is_favorite: boolean;
  last_used_at: string | null;
  created_at: string;
}

interface JobTemplateManagerProps {
  onLoadTemplate: (templateData: any) => void;
  onSaveTemplate?: (name: string, data: any) => void;
  currentWizardData?: any;
  className?: string;
}

export const JobTemplateManager: React.FC<JobTemplateManagerProps> = ({
  onLoadTemplate,
  onSaveTemplate,
  currentWizardData,
  className
}) => {
  const [templates, setTemplates] = useState<JobTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('job_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('last_used_at', { ascending: false })
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async () => {
    if (!templateName.trim() || !currentWizardData) {
      toast.error('Please enter a template name');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const templateData = {
        user_id: user.id,
        name: templateName.trim(),
        category: currentWizardData.category || '',
        subcategory: currentWizardData.subcategory || '',
        micro_service: currentWizardData.microService || '',
        template_data: {
          generalAnswers: currentWizardData.generalAnswers || {},
          microAnswers: currentWizardData.microAnswers || {},
          title: currentWizardData.title || '',
          budgetRange: currentWizardData.budgetRange || ''
        }
      };

      const { error } = await supabase
        .from('job_templates')
        .insert(templateData);

      if (error) throw error;

      toast.success('Template saved successfully!');
      setShowSaveDialog(false);
      setTemplateName('');
      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  const loadTemplate = async (template: JobTemplate) => {
    try {
      // Update usage statistics
      await supabase
        .from('job_templates')
        .update({
          usage_count: template.usage_count + 1,
          last_used_at: new Date().toISOString()
        })
        .eq('id', template.id);

      // Load template data into wizard
      onLoadTemplate({
        category: template.category,
        subcategory: template.subcategory,
        microService: template.micro_service,
        serviceId: '', // Will be resolved from service selection
        ...template.template_data
      });

      toast.success(`Loaded template: ${template.name}`);
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error('Failed to load template');
    }
  };

  const toggleFavorite = async (template: JobTemplate) => {
    try {
      await supabase
        .from('job_templates')
        .update({ is_favorite: !template.is_favorite })
        .eq('id', template.id);

      setTemplates(prev => prev.map(t => 
        t.id === template.id ? { ...t, is_favorite: !t.is_favorite } : t
      ));
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      await supabase
        .from('job_templates')
        .delete()
        .eq('id', templateId);

      setTemplates(prev => prev.filter(t => t.id !== templateId));
      toast.success('Template deleted');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.micro_service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favoriteTemplates = filteredTemplates.filter(t => t.is_favorite);
  const recentTemplates = filteredTemplates.filter(t => !t.is_favorite && t.last_used_at);
  const otherTemplates = filteredTemplates.filter(t => !t.is_favorite && !t.last_used_at);

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Job Templates</h3>
          </div>
          
          {currentWizardData && onSaveTemplate && (
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Save Current
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Job Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Template name (e.g., Kitchen Plumbing)"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={saveTemplate}>Save Template</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {templates.length > 0 && (
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading templates...
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No saved templates yet</p>
            <p className="text-sm">Save your current job settings to reuse them later</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {/* Favorite Templates */}
            {favoriteTemplates.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Favorites
                </h4>
                <div className="space-y-2">
                  {favoriteTemplates.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onLoad={() => loadTemplate(template)}
                      onToggleFavorite={() => toggleFavorite(template)}
                      onDelete={() => deleteTemplate(template.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Templates */}
            {recentTemplates.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Recently Used
                </h4>
                <div className="space-y-2">
                  {recentTemplates.slice(0, 5).map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onLoad={() => loadTemplate(template)}
                      onToggleFavorite={() => toggleFavorite(template)}
                      onDelete={() => deleteTemplate(template.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other Templates */}
            {otherTemplates.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  All Templates
                </h4>
                <div className="space-y-2">
                  {otherTemplates.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onLoad={() => loadTemplate(template)}
                      onToggleFavorite={() => toggleFavorite(template)}
                      onDelete={() => deleteTemplate(template.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

interface TemplateCardProps {
  template: JobTemplate;
  onLoad: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onLoad,
  onToggleFavorite,
  onDelete
}) => {
  return (
    <div className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium truncate">{template.name}</h4>
          {template.is_favorite && (
            <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
          )}
        </div>
        <div className="flex flex-wrap gap-1 mb-1">
          <Badge variant="secondary" className="text-xs">
            {template.category}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {template.micro_service}
          </Badge>
        </div>
        {template.usage_count > 0 && (
          <p className="text-xs text-muted-foreground">
            Used {template.usage_count} time{template.usage_count !== 1 ? 's' : ''}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          size="sm"
          variant="ghost"
          onClick={onToggleFavorite}
          className="w-8 h-8 p-0"
        >
          <Star className={`w-3 h-3 ${template.is_favorite ? 'text-yellow-500 fill-current' : 'text-muted-foreground'}`} />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          className="w-8 h-8 p-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
        <Button size="sm" onClick={onLoad}>
          Use
        </Button>
      </div>
    </div>
  );
};
