import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useBookingTemplates } from '@/hooks/bookings';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface BookingTemplateManagerProps {
  userId: string;
}

export const BookingTemplateManager = ({ userId }: BookingTemplateManagerProps) => {
  const { templates, isLoading, createTemplate, deleteTemplate } = useBookingTemplates(userId);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    default_duration: 60,
    default_price: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTemplate({
      user_id: userId,
      ...formData,
    });
    setFormData({ name: '', description: '', default_duration: 60, default_price: 0 });
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Booking Templates</h2>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Template</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.default_duration}
                    onChange={(e) =>
                      setFormData({ ...formData, default_duration: parseInt(e.target.value) })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Default Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.default_price}
                    onChange={(e) =>
                      setFormData({ ...formData, default_price: parseFloat(e.target.value) })
                    }
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {isLoading ? (
          <p className="text-muted-foreground">Loading templates...</p>
        ) : templates?.length === 0 ? (
          <p className="text-muted-foreground">No templates yet. Create your first one!</p>
        ) : (
          templates?.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {template.name}
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTemplate(template.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                <div className="flex gap-4 text-sm">
                  <span>Duration: {template.default_duration}min</span>
                  {template.default_price && <span>Price: ${template.default_price}</span>}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
