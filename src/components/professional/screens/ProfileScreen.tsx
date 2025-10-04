import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EnhancedProfileCard } from '@/components/professional/EnhancedProfileCard';
import { ServiceManagementPanel } from '@/components/professional/ServiceManagementPanel';
import { useProfessionalServices } from '@/hooks/useProfessionalServices';
import { useProfessionalStats } from '@/hooks/useProfessionalStats';
import { useSubscription } from '@/hooks/useSubscription';
import { 
  User, MapPin, DollarSign, Settings, 
  Camera, Plus, Edit, Save, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface ProfileScreenProps {
  user: any;
  profile: any;
}

export const ProfileScreen = ({ user, profile }: ProfileScreenProps) => {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const { services, loading, addService, updateService, deleteService, toggleActive } = useProfessionalServices(user?.id);
  const stats = useProfessionalStats(user?.id);
  const { createCheckout } = useSubscription();

  const [coverageMap, setCoverageMap] = useState({
    center: 'Dublin City Centre',
    radius: 15,
    zones: ['Dublin 1', 'Dublin 2', 'Dublin 4', 'Rathmines', 'Blackrock']
  });

  const portfolioImages = [
    { id: '1', url: '/api/placeholder/150/150', title: 'Kitchen Renovation', category: 'Before/After' },
    { id: '2', url: '/api/placeholder/150/150', title: 'Bathroom Tile Work', category: 'Completed' },
    { id: '3', url: '/api/placeholder/150/150', title: 'Custom Cabinets', category: 'Featured' }
  ];

  const handleSaveSection = (section: string) => {
    toast.success(`${section} updated successfully`);
    setEditingSection(null);
  };

  const renderCoverageMap = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Coverage Area
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Service Radius</label>
          <div className="mt-2">
            <Slider
              value={[coverageMap.radius]}
              onValueChange={([value]) => setCoverageMap({...coverageMap, radius: value})}
              max={50}
              min={5}
              step={1}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 km</span>
              <span className="font-medium">{coverageMap.radius} km from {coverageMap.center}</span>
              <span>50 km</span>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Coverage Zones</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {coverageMap.zones.map((zone, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {zone}
              </Badge>
            ))}
          </div>
        </div>

        <div className="p-3 bg-orange-50 border border-orange-200 rounded">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-orange-800">Travel Cost Warning</h4>
              <p className="text-xs text-orange-700 mt-1">
                Jobs beyond 20km may not be profitable due to travel time and fuel costs.
                Consider increasing rates for distant locations.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderPortfolioGallery = () => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Portfolio Gallery</CardTitle>
          <Button size="sm" variant="outline">
            <Camera className="w-3 h-3 mr-1" />
            Add Photos
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {portfolioImages.map((image) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <img 
                  src={image.url} 
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <Button size="sm" variant="secondary">
                  <Edit className="w-3 h-3" />
                </Button>
              </div>
              <div className="mt-1">
                <p className="text-xs font-medium">{image.title}</p>
                <Badge variant="outline" className="text-xs mt-1">{image.category}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 space-y-6">
      {/* Enhanced Profile Card */}
      <EnhancedProfileCard
        profile={{
          user_id: user?.id,
          business_name: profile.full_name || 'Professional',
          bio: profile.bio,
          service_categories: services.map(s => s.micro_service_id),
          verification_status: profile.verification_status || 'pending',
          is_active: true
        }}
        stats={{
          completed_jobs: stats.performance?.stats.completed_bookings || 0,
          average_rating: stats.performance?.stats.average_rating || 0,
          response_time_hours: 24
        }}
        onUpgrade={async () => {
          await createCheckout('price_abc123'); // Replace with actual Pro price ID
        }}
        onManageServices={() => setShowServiceModal(true)}
      />

      {/* Service Management */}
      <ServiceManagementPanel
        services={services.map(s => ({
          id: s.id,
          micro_service_id: s.micro_service_id,
          service_name: s.micro_service_id, // Should be enriched with actual name
          is_active: s.is_active,
          service_areas: (Array.isArray(s.service_areas) ? s.service_areas : []) as string[],
          pricing_structure: s.pricing_structure as any
        }))}
        onAddService={() => setShowServiceModal(true)}
        onEditService={(serviceId) => {
          toast.info('Edit service modal coming soon');
        }}
        onDeleteService={async (serviceId) => {
          await deleteService(serviceId);
        }}
        onToggleActive={async (serviceId, isActive) => {
          await toggleActive(serviceId, isActive);
        }}
      />

      {/* Coverage Map */}
      {renderCoverageMap()}

      {/* Portfolio Gallery */}
      {renderPortfolioGallery()}

      {/* Professional Bio */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Professional Bio</CardTitle>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setEditingSection(editingSection === 'bio' ? null : 'bio')}
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {editingSection === 'bio' ? (
            <div className="space-y-3">
              <Textarea 
                placeholder="Tell potential clients about your experience, specialties, and approach to work..."
                className="min-h-[100px]"
                defaultValue="Professional tradesman with 8+ years experience in home renovation and repair. Specialized in kitchen and bathroom installations with a focus on quality craftsmanship and customer satisfaction."
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleSaveSection('Bio')}>
                  <Save className="w-3 h-3 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingSection(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm">
                Professional tradesman with 8+ years experience in home renovation and repair. 
                Specialized in kitchen and bathroom installations with a focus on quality craftsmanship 
                and customer satisfaction.
              </p>
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                <strong>AI Tone Helper:</strong> Your bio sounds professional and trustworthy. Consider adding specific certifications or recent training to build more credibility.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Quick Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <h4 className="font-medium text-sm">Auto-bid on Gap Fillers</h4>
              <p className="text-xs text-muted-foreground">Automatically bid on jobs that fit your schedule gaps</p>
            </div>
            <input type="checkbox" className="w-4 h-4" />
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <h4 className="font-medium text-sm">Instant Booking</h4>
              <p className="text-xs text-muted-foreground">Allow clients to book available slots directly</p>
            </div>
            <input type="checkbox" className="w-4 h-4" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <h4 className="font-medium text-sm">Weekend Availability</h4>
              <p className="text-xs text-muted-foreground">Accept jobs on weekends (+25% rate)</p>
            </div>
            <input type="checkbox" className="w-4 h-4" defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};