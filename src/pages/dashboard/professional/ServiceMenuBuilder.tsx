import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Eye, Save, Menu } from 'lucide-react';

interface ServiceItem {
  id: string;
  name: string;
  description: string | null;
  long_description: string | null;
  base_price: number;
  pricing_type: string;
  unit_type: string;
  group_name: string | null;
  whats_included: string[] | null;
  specifications: any;
  sort_order: number;
  is_active: boolean;
}

export default function ServiceMenuBuilder() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedService, setSelectedService] = useState<string>('');
  const [editingItem, setEditingItem] = useState<Partial<ServiceItem> | null>(null);

  // Fetch professional's services
  const { data: services = [] } = useQuery({
    queryKey: ['professional-services', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professional_service_items')
        .select('service_id')
        .eq('professional_id', user!.id)
        .order('service_id');

      if (error) throw error;
      
      // Get unique services
      const uniqueServices = Array.from(
        new Map(data.map(item => [item.service_id, item])).values()
      );
      
      return uniqueServices;
    },
    enabled: !!user,
  });

  // Fetch service items for selected service
  const { data: serviceItems = [], isLoading } = useQuery({
    queryKey: ['service-items', selectedService, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professional_service_items')
        .select('*')
        .eq('professional_id', user!.id)
        .eq('service_id', selectedService)
        .order('group_name')
        .order('sort_order');

      if (error) throw error;
      return data as ServiceItem[];
    },
    enabled: !!selectedService && !!user,
  });

  const createItemMutation = useMutation({
    mutationFn: async (item: Partial<ServiceItem>) => {
      const payload = {
        ...item,
        professional_id: user!.id,
        service_id: selectedService,
      };
      
      const { data, error } = await supabase
        .from('professional_service_items')
        .insert(payload as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-items'] });
      toast({ title: 'Item created successfully' });
      setEditingItem(null);
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ServiceItem> & { id: string }) => {
      const { error } = await supabase
        .from('professional_service_items')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-items'] });
      toast({ title: 'Item updated successfully' });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('professional_service_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-items'] });
      toast({ title: 'Item deleted' });
    },
  });

  const handleSaveItem = () => {
    if (!editingItem) return;

    if (editingItem.id) {
      updateItemMutation.mutate(editingItem as ServiceItem & { id: string });
    } else {
      createItemMutation.mutate(editingItem);
    }
  };

  const groupedItems = serviceItems.reduce((groups, item) => {
    const key = item.group_name || 'General';
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {} as Record<string, ServiceItem[]>);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Service Menu Builder</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your service offerings with transparent pricing
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(`/professionals/${user?.id}`)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview Profile
        </Button>
      </div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        {/* Sidebar - Service Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Your Services</CardTitle>
            <CardDescription>Select a service to manage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {services.map((service) => (
              <Button
                key={service.service_id}
                variant={selectedService === service.service_id ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setSelectedService(service.service_id)}
              >
                <Menu className="h-4 w-4 mr-2" />
                {service.service_id}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Main Content - Menu Items */}
        <div className="space-y-6">
          {!selectedService ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Select a service from the sidebar to manage its menu
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Add New Item */}
              <Card>
                <CardHeader>
                  <CardTitle>Add Service Item</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Item Name *</Label>
                      <Input
                        placeholder="e.g., Deep Cleaning (2 bedrooms)"
                        value={editingItem?.name || ''}
                        onChange={(e) =>
                          setEditingItem({ ...editingItem, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Group/Category</Label>
                      <Input
                        placeholder="e.g., Cleaning Packages"
                        value={editingItem?.group_name || ''}
                        onChange={(e) =>
                          setEditingItem({ ...editingItem, group_name: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Short Description</Label>
                    <Textarea
                      placeholder="Brief description shown in the menu"
                      value={editingItem?.description || ''}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, description: e.target.value })
                      }
                      rows={2}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Price *</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={editingItem?.base_price || ''}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            base_price: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Pricing Type</Label>
                      <Select
                        value={editingItem?.pricing_type || 'fixed'}
                        onValueChange={(value) =>
                          setEditingItem({ ...editingItem, pricing_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Fixed Price</SelectItem>
                          <SelectItem value="per_hour">Per Hour</SelectItem>
                          <SelectItem value="per_unit">Per Unit</SelectItem>
                          <SelectItem value="per_m2">Per m²</SelectItem>
                          <SelectItem value="quote_required">Quote Required</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Unit Label</Label>
                      <Input
                        placeholder="e.g., hour, m², item"
                        value={editingItem?.unit_type || ''}
                        onChange={(e) =>
                          setEditingItem({ ...editingItem, unit_type: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveItem} disabled={!editingItem?.name}>
                    <Save className="h-4 w-4 mr-2" />
                    {editingItem?.id ? 'Update Item' : 'Add Item'}
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Menu Items ({serviceItems.length})</CardTitle>
                  <CardDescription>Click to edit</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p className="text-muted-foreground text-center py-8">Loading...</p>
                  ) : serviceItems.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No items yet. Add your first service item above.
                    </p>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(groupedItems).map(([groupName, items]) => (
                        <div key={groupName}>
                          <h3 className="font-semibold mb-3">{groupName}</h3>
                          <div className="space-y-2">
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50"
                              >
                                <div
                                  className="flex-1 cursor-pointer"
                                  onClick={() => setEditingItem(item)}
                                >
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    €{item.base_price} {item.unit_type && `/ ${item.unit_type}`}
                                  </p>
                                </div>
                                <Badge variant={item.is_active ? 'default' : 'secondary'}>
                                  {item.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteItemMutation.mutate(item.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
