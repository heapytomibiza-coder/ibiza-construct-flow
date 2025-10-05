import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Check } from 'lucide-react';

interface ServiceManagementModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (service: {
    micro_service_id: string;
    service_areas: string[];
    pricing_structure?: {
      base_rate?: number;
      hourly_rate?: number;
      min_charge?: number;
    };
  }) => void;
  editingService?: {
    id: string;
    micro_service_id: string;
    service_areas: string[];
    pricing_structure?: any;
  };
}

const AVAILABLE_SERVICES = [
  { id: 'plumbing', label: 'Plumbing' },
  { id: 'electrical', label: 'Electrical' },
  { id: 'carpentry', label: 'Carpentry' },
  { id: 'painting', label: 'Painting' },
  { id: 'cleaning', label: 'Cleaning' },
  { id: 'gardening', label: 'Gardening' },
  { id: 'general-repair', label: 'General Repair' },
];

const IBIZA_ZONES = [
  { id: 'ibiza-town', label: 'Ibiza Town' },
  { id: 'san-antonio', label: 'San Antonio' },
  { id: 'santa-eulalia', label: 'Santa Eulalia' },
  { id: 'playa-den-bossa', label: 'Playa d\'en Bossa' },
  { id: 'san-josep', label: 'San Josep' },
  { id: 'es-vedra', label: 'Es Vedra Area' },
  { id: 'anywhere', label: 'Island-wide' },
];

export const ServiceManagementModal = ({ 
  open, 
  onClose, 
  onSave,
  editingService 
}: ServiceManagementModalProps) => {
  const [selectedService, setSelectedService] = useState(editingService?.micro_service_id || '');
  const [selectedAreas, setSelectedAreas] = useState<string[]>(editingService?.service_areas || []);
  const [baseRate, setBaseRate] = useState(editingService?.pricing_structure?.base_rate || 0);
  const [hourlyRate, setHourlyRate] = useState(editingService?.pricing_structure?.hourly_rate || 0);
  const [minCharge, setMinCharge] = useState(editingService?.pricing_structure?.min_charge || 0);

  const handleAreaToggle = (areaId: string) => {
    if (selectedAreas.includes(areaId)) {
      setSelectedAreas(selectedAreas.filter(id => id !== areaId));
    } else {
      setSelectedAreas([...selectedAreas, areaId]);
    }
  };

  const handleSave = () => {
    if (!selectedService || selectedAreas.length === 0) {
      return;
    }

    onSave({
      micro_service_id: selectedService,
      service_areas: selectedAreas,
      pricing_structure: {
        base_rate: baseRate || undefined,
        hourly_rate: hourlyRate || undefined,
        min_charge: minCharge || undefined,
      }
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingService ? 'Edit Service' : 'Add New Service'}
          </DialogTitle>
          <DialogDescription>
            Configure the service you offer and set your pricing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Service Selection */}
          <div className="space-y-3">
            <Label>Service Type</Label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SERVICES.map((service) => (
                <Badge
                  key={service.id}
                  variant={selectedService === service.id ? 'default' : 'outline'}
                  className="cursor-pointer hover:opacity-80 transition-all px-3 py-2"
                  onClick={() => setSelectedService(service.id)}
                >
                  {service.label}
                  {selectedService === service.id && (
                    <Check className="w-3 h-3 ml-2" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Service Areas */}
          <div className="space-y-3">
            <Label>Service Areas</Label>
            <div className="flex flex-wrap gap-2">
              {IBIZA_ZONES.map((zone) => (
                <Badge
                  key={zone.id}
                  variant={selectedAreas.includes(zone.id) ? 'default' : 'outline'}
                  className="cursor-pointer hover:opacity-80 transition-all px-3 py-2"
                  onClick={() => handleAreaToggle(zone.id)}
                >
                  <MapPin className="w-3 h-3 mr-1" />
                  {zone.label}
                  {selectedAreas.includes(zone.id) && (
                    <Check className="w-3 h-3 ml-2" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <Label>Pricing Structure (Optional)</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base-rate" className="text-sm">Base Rate (€)</Label>
                <Input
                  id="base-rate"
                  type="number"
                  min="0"
                  step="5"
                  value={baseRate || ''}
                  onChange={(e) => setBaseRate(Number(e.target.value))}
                  placeholder="50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hourly-rate" className="text-sm">Hourly Rate (€)</Label>
                <Input
                  id="hourly-rate"
                  type="number"
                  min="0"
                  step="5"
                  value={hourlyRate || ''}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  placeholder="30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-charge" className="text-sm">Min Charge (€)</Label>
                <Input
                  id="min-charge"
                  type="number"
                  min="0"
                  step="5"
                  value={minCharge || ''}
                  onChange={(e) => setMinCharge(Number(e.target.value))}
                  placeholder="25"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!selectedService || selectedAreas.length === 0}
          >
            {editingService ? 'Save Changes' : 'Add Service'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
