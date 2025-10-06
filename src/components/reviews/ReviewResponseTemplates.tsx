import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Trash2, Copy } from 'lucide-react';
import { useReviewInsights } from '@/hooks/useReviewInsights';
import { useToast } from '@/hooks/use-toast';

export const ReviewResponseTemplates = () => {
  const { templates, loading, createTemplate, deleteTemplate, useTemplate } = useReviewInsights();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateText, setTemplateText] = useState('');
  const [templateCategory, setTemplateCategory] = useState<'positive' | 'negative' | 'neutral'>('positive');
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!templateName.trim() || !templateText.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    await createTemplate(templateName, templateText, templateCategory);
    setDialogOpen(false);
    setTemplateName('');
    setTemplateText('');
    setTemplateCategory('positive');
  };

  const handleCopy = (text: string, templateId: string) => {
    navigator.clipboard.writeText(text);
    useTemplate(templateId);
    toast({
      title: 'Copied to clipboard',
      description: 'Template text has been copied'
    });
  };

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'positive': return 'default';
      case 'negative': return 'destructive';
      case 'neutral': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Response Templates</h2>
          <p className="text-muted-foreground">
            Save time with pre-written review responses
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Response Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Thank you response"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={templateCategory}
                  onValueChange={(value: any) => setTemplateCategory(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="text">Template Text</Label>
                <Textarea
                  id="text"
                  placeholder="Write your template response here..."
                  value={templateText}
                  onChange={(e) => setTemplateText(e.target.value)}
                  rows={6}
                />
              </div>

              <Button onClick={handleCreate} className="w-full">
                Create Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="p-4">
              <div className="space-y-3">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-20 bg-muted animate-pulse rounded" />
              </div>
            </Card>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No templates yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Create templates to quickly respond to reviews
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <Card key={template.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{template.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={getCategoryColor(template.category)}>
                        {template.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Used {template.usage_count} times
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3">
                  {template.template_text}
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleCopy(template.template_text, template.id)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Template
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
