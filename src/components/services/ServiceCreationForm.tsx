import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Cascader from '@/components/common/Cascader';
import { ServicePhotoUploader } from './ServicePhotoUploader';
import { 
  Package, 
  DollarSign, 
  Clock, 
  Star, 
  Save, 
  Plus,
  Minus,
  Zap
} from 'lucide-react';

interface ServiceCreationFormProps {
  professionalId: string;
  onServiceCreated?: (serviceId: string) => void;
}

interface PricingTier {
  name: string;
  price: number;
  description: string;
  includes: string[];
}

const defaultTiers: PricingTier[] = [
  {
    name: 'Basic',
    price: 50,
    description: 'Essential service package',
    includes: ['Standard quality work', 'Basic tools included', 'Clean-up after work']
  },
  {
    name: 'Standard',
    price: 80,
    description: 'Most popular choice',
    includes: ['High quality work', 'Premium tools', 'Clean-up after work', '1 year warranty']
  },
  {
    name: 'Premium',
    price: 120,
    description: 'Complete professional service',
    includes: ['Premium quality work', 'Professional grade tools', 'Complete clean-up', '2 year warranty', 'Priority support']
  }
];

export const ServiceCreationForm: React.FC<ServiceCreationFormProps> = ({
  professionalId,
  onServiceCreated
}) => {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: 0,
    pricing_type: 'fixed',
    unit_type: 'service',
    min_quantity: 1,
    max_quantity: null as number | null,
    category: 'labor',
    difficulty_level: 'standard',
    estimated_duration_minutes: 60,
    is_active: true
  });
  
  const [images, setImages] = useState<string[]>([]);
  const [primaryImage, setPrimaryImage] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [quoteRequired, setQuoteRequired] = useState(false);

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    setFormData(prev => ({
      ...prev,
      name: service.micro,
      category: service.category.toLowerCase(),
    }));
  };

  const updateFormField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!selectedService) {
      toast.error('Please select a service type');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Please enter a service name');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('professional_service_items')
        .insert({
          professional_id: professionalId,
          service_id: selectedService.id,
          name: formData.name,
          description: formData.description,
          base_price: quoteRequired ? null : formData.base_price,
          pricing_type: quoteRequired ? 'quote_required' : formData.pricing_type,
          unit_type: formData.unit_type,
          min_quantity: formData.min_quantity,
          max_quantity: formData.max_quantity,
          difficulty_level: formData.difficulty_level,
          estimated_duration_minutes: formData.estimated_duration_minutes,
          is_active: formData.is_active,
          primary_image_url: primaryImage,
          gallery_images: images,
          video_url: videoUrl,
          category: selectedService.category,
          subcategory: selectedService.subcategory,
          micro: selectedService.micro,
        });

      if (error) throw error;

      toast.success('Service created successfully!');
      onServiceCreated?.(selectedService.id);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        base_price: 0,
        pricing_type: 'fixed',
        unit_type: 'service',
        min_quantity: 1,
        max_quantity: null,
        category: 'labor',
        difficulty_level: 'standard',
        estimated_duration_minutes: 60,
        is_active: true
      });
      setSelectedService(null);
      setImages([]);
      setPrimaryImage('');
      setVideoUrl('');
      
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('Failed to create service');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Create New Service
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Service Selection */}
          <div className="space-y-2">
            <Label>Select Service Type *</Label>
            <Cascader
              onChange={handleServiceSelect}
              placeholder="Choose from service categories..."
              className="w-full"
            />
            {selectedService && (
              <Badge variant="outline" className="mt-2">
                {selectedService.category} → {selectedService.subcategory} → {selectedService.micro}
              </Badge>
            )}
          </div>

          {/* Service Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormField('name', e.target.value)}
                placeholder="e.g., Kitchen Cabinet Installation"
              />
            </div>

            <div className="space-y-2">
              <Label>Pricing</Label>
              <div className="flex items-center gap-3 mb-2">
                <Switch
                  id="quote-required"
                  checked={quoteRequired}
                  onCheckedChange={setQuoteRequired}
                />
                <Label htmlFor="quote-required" className="cursor-pointer">
                  Quote Required (No Fixed Price)
                </Label>
              </div>
              {!quoteRequired && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <Input
                    type="number"
                    value={formData.base_price}
                    onChange={(e) => updateFormField('base_price', Number(e.target.value))}
                    placeholder="0"
                  />
                  <Select
                    value={formData.pricing_type}
                    onValueChange={(value) => updateFormField('pricing_type', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="per_hour">Per Hour</SelectItem>
                      <SelectItem value="per_unit">Per Unit</SelectItem>
                      <SelectItem value="per_square_meter">Per m²</SelectItem>
                      <SelectItem value="per_project">Per Project</SelectItem>
                      <SelectItem value="range">Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Service Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormField('description', e.target.value)}
                placeholder="Describe your service in detail..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Estimated Duration (optional)</Label>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <Input
                  id="duration"
                  type="number"
                  value={formData.estimated_duration_minutes}
                  onChange={(e) => updateFormField('estimated_duration_minutes', Number(e.target.value))}
                  placeholder="60"
                />
                <span className="text-sm text-muted-foreground">minutes</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo & Video Upload */}
      <ServicePhotoUploader
        serviceItemId="new-service"
        currentImages={images}
        currentVideo={videoUrl}
        onImagesUpdate={(newImages, primary) => {
          setImages(newImages);
          if (primary) setPrimaryImage(primary);
        }}
        onVideoUpdate={setVideoUrl}
      />

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={saving || !selectedService}
          size="lg"
          className="flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Create Service
            </>
          )}
        </Button>
      </div>
    </div>
  );
};