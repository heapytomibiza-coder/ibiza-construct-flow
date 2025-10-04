import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { Plus, Edit2, Trash2, MapPin, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Service {
  id: string;
  micro_service_id: string;
  service_name: string;
  is_active: boolean;
  service_areas: string[];
  pricing_structure?: any;
}

interface ServiceManagementPanelProps {
  services: Service[];
  onAddService: () => void;
  onEditService: (serviceId: string) => void;
  onDeleteService: (serviceId: string) => void;
  onToggleActive: (serviceId: string, isActive: boolean) => void;
}

export const ServiceManagementPanel: React.FC<ServiceManagementPanelProps> = ({
  services,
  onAddService,
  onEditService,
  onDeleteService,
  onToggleActive
}) => {
  const { tier, createCheckout } = useSubscription();

  const getServiceLimit = () => {
    switch (tier) {
      case 'premium':
        return null; // unlimited
      case 'pro':
        return 10;
      default:
        return 3;
    }
  };

  const serviceLimit = getServiceLimit();
  const canAddMore = serviceLimit === null || services.length < serviceLimit;
  const activeServices = services.filter(s => s.is_active).length;

  const handleUpgrade = async (targetTier: 'pro' | 'premium') => {
    const priceIds = {
      pro: 'price_abc123', // Replace with actual price ID
      premium: 'price_xyz789' // Replace with actual price ID
    };
    await createCheckout(priceIds[targetTier]);
  };

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Services</CardTitle>
              <CardDescription>
                {serviceLimit === null 
                  ? `${activeServices} active services` 
                  : `${services.length} of ${serviceLimit} services used`}
              </CardDescription>
            </div>
            <Button 
              onClick={onAddService} 
              disabled={!canAddMore}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Upgrade Alert for Basic/Pro Users */}
      {tier !== 'premium' && services.length >= (serviceLimit || 0) - 1 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              {tier === 'basic' 
                ? 'Upgrade to Pro for 10 services or Premium for unlimited'
                : 'Upgrade to Premium for unlimited services'}
            </span>
            {tier === 'basic' && (
              <Button onClick={() => handleUpgrade('pro')} variant="outline" size="sm">
                Upgrade to Pro
              </Button>
            )}
            {tier === 'pro' && (
              <Button onClick={() => handleUpgrade('premium')} variant="outline" size="sm">
                Upgrade to Premium
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Services List */}
      <div className="grid gap-4">
        {services.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">
                No services added yet. Add your first service to start receiving job matches.
              </p>
              <Button onClick={onAddService}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Service
              </Button>
            </CardContent>
          </Card>
        ) : (
          services.map((service) => (
            <Card key={service.id} className={!service.is_active ? 'opacity-60' : ''}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{service.service_name}</h3>
                      <Badge variant={service.is_active ? 'default' : 'outline'}>
                        {service.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    {service.service_areas && service.service_areas.length > 0 && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="w-3 h-3" />
                        <span>{service.service_areas.join(', ')}</span>
                      </div>
                    )}

                    {service.pricing_structure && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Starting from: </span>
                        <span className="font-medium">
                          ${service.pricing_structure.base_price || 'Contact for quote'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleActive(service.id, !service.is_active)}
                    >
                      {service.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditService(service.id)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteService(service.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
