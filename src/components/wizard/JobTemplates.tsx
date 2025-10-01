import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookmarkPlus, 
  Star, 
  Clock, 
  Trash2, 
  Loader2,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface JobTemplate {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  micro_service: string;
  template_data: any;
  is_favorite: boolean;
  usage_count: number;
  last_used_at: string;
}

interface JobTemplatesProps {
  category: string;
  subcategory: string;
  microService: string;
  onUseTemplate: (templateData: any) => void;
  onSaveAsTemplate?: (name: string, data: any) => void;
}

export const JobTemplates: React.FC<JobTemplatesProps> = ({
  category,
  subcategory,
  microService,
  onUseTemplate,
  onSaveAsTemplate
}) => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<JobTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTemplates();
    }
  }, [user, category, subcategory, microService]);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('job_templates')
        .select('*')
        .eq('user_id', user?.id)
        .eq('category', category)
        .eq('subcategory', subcategory)
        .eq('micro_service', microService)
        .order('last_used_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async (template: JobTemplate) => {
    try {
      // Update usage count
      await supabase
        .from('job_templates')
        .update({ 
          usage_count: template.usage_count + 1,
          last_used_at: new Date().toISOString()
        })
        .eq('id', template.id);

      onUseTemplate(template.template_data);
      toast.success(`Template "${template.name}" loaded`);
    } catch (error) {
      console.error('Error using template:', error);
      toast.error('Failed to load template');
    }
  };

  const handleToggleFavorite = async (template: JobTemplate) => {
    try {
      await supabase
        .from('job_templates')
        .update({ is_favorite: !template.is_favorite })
        .eq('id', template.id);

      setTemplates(prev =>
        prev.map(t =>
          t.id === template.id ? { ...t, is_favorite: !t.is_favorite } : t
        )
      );
      toast.success(template.is_favorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDelete = async (templateId: string) => {
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

  if (!user) return null;

  if (loading) {
    return (
      <Card className="p-6 border-2 border-muted">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading templates...</span>
        </div>
      </Card>
    );
  }

  if (templates.length === 0) {
    return (
      <Card className="p-6 border-2 border-dashed border-muted bg-muted/5">
        <div className="text-center space-y-2">
          <FileText className="w-8 h-8 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">
            No saved templates for this service yet
          </p>
          <p className="text-xs text-muted-foreground">
            Complete this form once and save it as a template for future use
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-2 border-primary/20 bg-primary/5">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookmarkPlus className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Your Templates</h3>
          <Badge variant="secondary" className="text-xs">
            {templates.length}
          </Badge>
        </div>

        <div className="space-y-2">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{template.name}</p>
                  {template.is_favorite && (
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Used {template.usage_count} times
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleToggleFavorite(template)}
                >
                  <Star className={`w-4 h-4 ${template.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(template.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <Button
                variant="default"
                size="sm"
                onClick={() => handleUseTemplate(template)}
              >
                Use
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
