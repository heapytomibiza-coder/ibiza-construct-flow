import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useServiceMicroUpsert } from '../../../packages/@contracts/clients/admin';
import { useGetServiceMicros } from '../../../packages/@contracts/clients/services';
import { ServiceMicroRow } from '@/lib/admin/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Edit, Save, X } from 'lucide-react';

/**
 * Admin Service Micro Manager
 * Phase 5: UI Component for managing services_micro
 */

export default function ServiceMicroManager() {
  const { toast } = useToast();
  const { data: services, isLoading } = useGetServiceMicros();
  const upsertMutation = useServiceMicroUpsert();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingService, setEditingService] = useState<ServiceMicroRow | null>(null);

  const handleCreate = () => {
    setEditingService({
      category: '',
      subcategory: '',
      micro: '',
      questions_micro: [],
      questions_logistics: [],
      is_active: true,
      sort_index: 0,
    });
    setIsEditing(true);
  };

  const handleEdit = (service: any) => {
    setEditingService({
      id: service.id,
      category: service.category,
      subcategory: service.subcategory,
      micro: service.micro,
      questions_micro: service.questions_micro || [],
      questions_logistics: service.questions_logistics || [],
      is_active: service.is_active,
      sort_index: service.sort_index || 0,
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditingService(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editingService) return;

    try {
      await upsertMutation.mutateAsync({
        ...editingService,
        change_summary: editingService.id ? 'Updated via admin UI' : 'Created via admin UI',
      });

      toast({
        title: 'Success',
        description: `Service ${editingService.id ? 'updated' : 'created'} successfully`,
      });

      handleCancel();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save service',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Service Management</h2>
          <p className="text-muted-foreground">Manage micro services catalog</p>
        </div>
        <Button onClick={handleCreate} disabled={isEditing}>
          <Plus className="mr-2 h-4 w-4" />
          Create Service
        </Button>
      </div>

      {isEditing && editingService && (
        <Card>
          <CardHeader>
            <CardTitle>{editingService.id ? 'Edit Service' : 'Create Service'}</CardTitle>
            <CardDescription>Fill in the service details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={editingService.category}
                  onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                  placeholder="e.g., Home Services"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory</Label>
                <Input
                  id="subcategory"
                  value={editingService.subcategory}
                  onChange={(e) => setEditingService({ ...editingService, subcategory: e.target.value })}
                  placeholder="e.g., Cleaning"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="micro">Micro Service Name</Label>
              <Input
                id="micro"
                value={editingService.micro}
                onChange={(e) => setEditingService({ ...editingService, micro: e.target.value })}
                placeholder="e.g., Deep Cleaning"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={editingService.is_active}
                onCheckedChange={(checked) => setEditingService({ ...editingService, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort_index">Sort Index</Label>
              <Input
                id="sort_index"
                type="number"
                value={editingService.sort_index}
                onChange={(e) => setEditingService({ ...editingService, sort_index: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={upsertMutation.isPending}>
                {upsertMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {services?.data?.map((service: any) => (
          <Card key={service.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{service.micro}</CardTitle>
                  <CardDescription>
                    {service.category} → {service.subcategory}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(service)}
                    disabled={isEditing}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Status: {service.is_active ? '✓ Active' : '✗ Inactive'}</span>
                <span>Sort: {service.sort_index}</span>
                <span>Questions: {service.questions_micro?.length || 0} micro, {service.questions_logistics?.length || 0} logistics</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
