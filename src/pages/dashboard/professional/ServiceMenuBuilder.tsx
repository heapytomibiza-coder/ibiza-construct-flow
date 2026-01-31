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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Eye, Save, Menu, Wrench, Info, ArrowRight } from 'lucide-react';

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

interface ServiceWithName {
  micro_service_id: string;
  is_active: boolean;
  service_name: string;
}

export default function ServiceMenuBuilder() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedServiceName, setSelectedServiceName] = useState<string>('');
  const [editingItem, setEditingItem] = useState<Partial<ServiceItem> | null>(null);

  // Fetch professional's active services from professional_services (the canonical source)
  // This shows ALL services they've opted into, not just ones with menu items
  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['professional-services-with-names', user?.id],
    queryFn: async () => {
      // First get the professional's services
      const { data: proServices, error: proError } = await supabase
        .from('professional_services')
        .select('micro_service_id, is_active')
        .eq('professional_id', user!.id)
        .eq('is_active', true)
        .order('micro_service_id');

      if (proError) throw proError;
      if (!proServices?.length) return [];

      // Then fetch the names for those services
      const microIds = proServices.map(s => s.micro_service_id);
      const { data: microData, error: microError } = await supabase
        .from('service_micro_categories')
        .select('id, name')
        .in('id', microIds);

      if (microError) throw microError;

      // Create a name lookup map
      const nameMap = new Map(microData?.map(m => [m.id, m.name]) || []);

      // Merge services with their names
      return proServices.map(s => ({
        micro_service_id: s.micro_service_id,
        is_active: s.is_active,
        service_name: nameMap.get(s.micro_service_id) ?? s.micro_service_id,
      })) as ServiceWithName[];
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
      // Calculate next sort_order within the group
      const existingInGroup = serviceItems.filter(si => si.group_name === item.group_name);
      const nextSortOrder = existingInGroup.length > 0 
        ? Math.max(...existingInGroup.map(si => si.sort_order || 0)) + 1 
        : 0;

      // Build payload with safe defaults
      const payload = {
        name: item.name,
        description: item.description ?? null,
        base_price: item.base_price ?? 0,
        pricing_type: item.pricing_type ?? 'fixed',
        unit_type: item.unit_type ?? '',
        group_name: item.group_name ?? null,
        sort_order: item.sort_order ?? nextSortOrder,
        is_active: item.is_active ?? true,
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
            <CardDescription>Select a service to manage its menu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {servicesLoading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Loading services...</p>
            ) : services.length === 0 ? (
              // Empty state - no services configured yet
              <div className="space-y-4 py-4">
                <div className="text-center">
                  <Wrench className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No services configured yet
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/professional/service-setup')}
                >
                  Configure Services
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ) : (
              services.map((service) => (
                <Button
                  key={service.micro_service_id}
                  variant={selectedService === service.micro_service_id ? 'default' : 'outline'}
                  className="w-full justify-start text-left"
                  onClick={() => {
                    setSelectedService(service.micro_service_id);
                    setSelectedServiceName(service.service_name);
                  }}
                >
                  <Menu className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{service.service_name}</span>
                </Button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Main Content - Menu Items */}
        <div className="space-y-6">
          {/* Info banner explaining this is optional */}
          <Alert className="bg-muted/50 border-muted">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Optional:</strong> Your base services are already configured. 
              Use this tool to create detailed pricing packages and menu items for each service.
            </AlertDescription>
          </Alert>

          {!selectedService ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Menu className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {services.length > 0 
                    ? 'Select a service from the sidebar to manage its pricing menu'
                    : 'Configure your services first to start building pricing menus'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Add New Item */}
              <Card>
                <CardHeader>
                  <CardTitle>Add Item to "{selectedServiceName}"</CardTitle>
                  <CardDescription>Create a pricing package or menu item</CardDescription>
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
