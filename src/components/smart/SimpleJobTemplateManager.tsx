import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, MoreHorizontal, Eye } from 'lucide-react';
import { toast } from 'sonner';

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

interface SimpleJobTemplateManagerProps {
  onLoadTemplate: (templateData: any) => void;
  currentWizardData?: any;
  className?: string;
}

export function SimpleJobTemplateManager({ 
  onLoadTemplate, 
  currentWizardData,
  className = '' 
}: SimpleJobTemplateManagerProps) {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<JobTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTemplates();
    }
  }, [user]);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('job_templates')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false })
        .limit(8); // Limit to most recent 8 templates

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
      // Update usage count and last used date
      const { error } = await supabase
        .from('job_templates')
        .update({
          usage_count: template.usage_count + 1,
          last_used_at: new Date().toISOString()
        })
        .eq('id', template.id);

      if (error) throw error;

      onLoadTemplate(template.template_data);
      toast.success(`Loaded template: ${template.name}`);
    } catch (error) {
      console.error('Error using template:', error);
      toast.error('Failed to load template');
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user || templates.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-4 text-center text-muted-foreground">
          <p className="text-sm">No templates found. Complete your first job to create templates.</p>
        </CardContent>
      </Card>
    );
  }

  const favorites = templates.filter(t => t.is_favorite).slice(0, 3);
  const recent = templates.filter(t => t.last_used_at && !t.is_favorite).slice(0, 3);
  const other = templates.filter(t => !t.is_favorite && !t.last_used_at).slice(0, 2);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-charcoal">Quick Templates</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.open('/templates', '_blank')}
            className="text-xs"
          >
            <MoreHorizontal className="w-4 h-4 mr-1" />
            View All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Favorites */}
        {favorites.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-muted-foreground">Favorites</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {favorites.map(template => (
                <TemplateQuickCard
                  key={template.id}
                  template={template}
                  onUse={handleUseTemplate}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent */}
        {recent.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-muted-foreground">Recently Used</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {recent.map(template => (
                <TemplateQuickCard
                  key={template.id}
                  template={template}
                  onUse={handleUseTemplate}
                />
              ))}
            </div>
          </div>
        )}

        {/* Other templates */}
        {other.length > 0 && favorites.length === 0 && recent.length === 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Templates</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {other.map(template => (
                <TemplateQuickCard
                  key={template.id}
                  template={template}
                  onUse={handleUseTemplate}
                />
              ))}
            </div>
          </div>
        )}

        {/* View All Templates Link */}
        <div className="pt-3 border-t border-border/50">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => window.open('/templates', '_blank')}
          >
            <Eye className="w-4 h-4 mr-2" />
            Manage All Templates ({templates.length})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Template Card Component
interface TemplateQuickCardProps {
  template: JobTemplate;
  onUse: (template: JobTemplate) => void;
}

function TemplateQuickCard({ template, onUse }: TemplateQuickCardProps) {
  return (
    <div 
      className="group p-3 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border/30 hover:border-border/60 transition-all duration-200 cursor-pointer"
      onClick={() => onUse(template)}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h4 className="text-sm font-medium text-charcoal truncate flex-1">
            {template.name}
          </h4>
          {template.is_favorite && (
            <Star className="w-3 h-3 text-amber-500 fill-current flex-shrink-0 ml-2" />
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Badge variant="secondary" className="text-xs px-2 py-0.5">
            {template.category}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Used {template.usage_count} times</span>
          {template.last_used_at && (
            <span>{new Date(template.last_used_at).toLocaleDateString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}
