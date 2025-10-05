import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import { useOnboardingChecklist } from '@/hooks/useOnboardingChecklist';

interface PortfolioItem {
  id?: string;
  title: string;
  description: string;
  project_date: string;
  category: string;
  client_name: string;
  skills_used: string[];
  images: string[];
  is_featured: boolean;
}

export default function ProfessionalPortfolioPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { markStepComplete } = useOnboardingChecklist();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to continue',
          variant: 'destructive',
        });
        navigate('/auth');
        return;
      }

      // Load portfolio items
      const { data: items, error } = await supabase
        .from('professional_portfolio')
        .select('*')
        .eq('professional_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPortfolioItems(items || []);
      setProfessionalId(user.id);
    } catch (error: any) {
      console.error('Error loading portfolio:', error);
      toast({
        title: 'Error',
        description: 'Failed to load portfolio',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingItem({
      title: '',
      description: '',
      project_date: '',
      category: '',
      client_name: '',
      skills_used: [],
      images: [],
      is_featured: false,
    });
    setShowForm(true);
  };

  const handleEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this portfolio item?')) return;

    try {
      const { error } = await supabase
        .from('professional_portfolio')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setPortfolioItems(prev => prev.filter(item => item.id !== itemId));
      toast({
        title: 'Item deleted',
        description: 'Portfolio item has been removed',
      });
    } catch (error: any) {
      console.error('Error deleting item:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete item',
        variant: 'destructive',
      });
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !professionalId) return;

    try {
      setSaving(true);

      if (editingItem.id) {
        // Update existing item
        const { error } = await supabase
          .from('professional_portfolio')
          .update({
            title: editingItem.title,
            description: editingItem.description,
            project_date: editingItem.project_date,
            category: editingItem.category,
            client_name: editingItem.client_name,
            skills_used: editingItem.skills_used,
            images: editingItem.images,
            is_featured: editingItem.is_featured,
          })
          .eq('id', editingItem.id);

        if (error) throw error;

        setPortfolioItems(prev =>
          prev.map(item => (item.id === editingItem.id ? editingItem : item))
        );
      } else {
        // Create new item
        const { data, error } = await supabase
          .from('professional_portfolio')
          .insert({
            professional_id: professionalId,
            title: editingItem.title,
            description: editingItem.description,
            project_date: editingItem.project_date,
            category: editingItem.category,
            client_name: editingItem.client_name,
            skills_used: editingItem.skills_used,
            images: editingItem.images,
            is_featured: editingItem.is_featured,
          })
          .select()
          .single();

        if (error) throw error;
        setPortfolioItems(prev => [data, ...prev]);
      }

      // Mark onboarding step as complete
      await markStepComplete('portfolio');

      toast({
        title: 'Portfolio updated',
        description: 'Your portfolio item has been saved',
      });

      setShowForm(false);
      setEditingItem(null);
    } catch (error: any) {
      console.error('Error saving portfolio item:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save portfolio item',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSkipForNow = async () => {
    await markStepComplete('portfolio');
    navigate('/dashboard/pro');
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Loading portfolio...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard/pro')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">My Portfolio</h1>
            <p className="text-muted-foreground">Showcase your best work</p>
          </div>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>

      {showForm && editingItem && (
        <Card>
          <CardHeader>
            <CardTitle>{editingItem.id ? 'Edit' : 'Add'} Portfolio Item</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={editingItem.title}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingItem.description}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, description: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={editingItem.category}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, category: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project_date">Project Date</Label>
                  <Input
                    id="project_date"
                    type="date"
                    value={editingItem.project_date}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, project_date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_name">Client Name (Optional)</Label>
                <Input
                  id="client_name"
                  value={editingItem.client_name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, client_name: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <>
          {portfolioItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center space-y-4">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium">No portfolio items yet</p>
                  <p className="text-muted-foreground">
                    Add your first project to showcase your work
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleAddNew}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Project
                  </Button>
                  <Button variant="outline" onClick={handleSkipForNow}>
                    Skip for now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {portfolioItems.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        {item.category && (
                          <Badge variant="secondary">{item.category}</Badge>
                        )}
                      </div>
                      {item.is_featured && (
                        <Badge variant="default">Featured</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {item.description}
                      </p>
                    )}
                    {item.project_date && (
                      <p className="text-xs text-muted-foreground">
                        Date: {new Date(item.project_date).toLocaleDateString()}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => item.id && handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
