import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase, Building, Upload, Save, X, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ServiceManagementPanel } from '@/components/professional/ServiceManagementPanel';
import { ServiceManagementModal } from '@/components/professional/ServiceManagementModal';
import { useProfessionalServices } from '@/hooks/useProfessionalServices';
import { useDropzone } from 'react-dropzone';

export default function ProfessionalSettings() {
  const { user } = useAuth();
  const { services, addService, updateService, deleteService, toggleActive } = useProfessionalServices(user?.id);
  
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [profile, setProfile] = useState({
    bio: '',
    hourly_rate: 0,
    business_name: '',
    vat_number: '',
    skills: [] as string[],
    portfolio_images: [] as string[]
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('professional_profiles')
      .select('bio, hourly_rate, business_name, vat_number, skills, portfolio_images')
      .eq('user_id', user.id)
      .single();

    if (data && !error) {
      setProfile({
        bio: data.bio || '',
        hourly_rate: data.hourly_rate || 0,
        business_name: data.business_name || '',
        vat_number: data.vat_number || '',
        skills: Array.isArray(data.skills) ? data.skills as string[] : [],
        portfolio_images: Array.isArray(data.portfolio_images) ? data.portfolio_images as string[] : []
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('professional_profiles')
        .upsert({
          user_id: user.id,
          bio: profile.bio,
          hourly_rate: profile.hourly_rate,
          business_name: profile.business_name,
          vat_number: profile.vat_number,
          skills: profile.skills,
          portfolio_images: profile.portfolio_images,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = useCallback(async (acceptedFiles: File[]) => {
    if (!user) return;
    
    setUploadingImages(true);
    try {
      const uploadedUrls: string[] = [];

      for (const file of acceptedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Math.random()}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from('professional-documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('professional-documents')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      const newImages = [...profile.portfolio_images, ...uploadedUrls];
      setProfile({ ...profile, portfolio_images: newImages });

      // Save to database
      const { error } = await supabase
        .from('professional_profiles')
        .upsert({
          user_id: user.id,
          portfolio_images: newImages,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success(`${acceptedFiles.length} image(s) uploaded successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  }, [user, profile]);

  const handleRemoveImage = async (imageUrl: string) => {
    if (!user) return;

    try {
      const newImages = profile.portfolio_images.filter(url => url !== imageUrl);
      setProfile({ ...profile, portfolio_images: newImages });

      const { error } = await supabase
        .from('professional_profiles')
        .upsert({
          user_id: user.id,
          portfolio_images: newImages,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Image removed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove image');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 20,
    onDrop: handleImageUpload
  });

  const handleAddService = () => {
    setEditingService(null);
    setShowServiceModal(true);
  };

  const handleEditService = (id: string) => {
    const service = services.find(s => s.id === id);
    if (service) {
      setEditingService(service);
      setShowServiceModal(true);
    }
  };

  const handleSaveService = async (serviceData: any) => {
    if (!user) return;

    try {
      if (editingService) {
        await updateService(editingService.id, serviceData);
        toast.success('Service updated successfully');
      } else {
        await addService(serviceData);
        toast.success('Service added successfully');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save service');
    }
  };

  return (
    <div className="space-y-6">
      {/* Services & Pricing */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            <div>
              <CardTitle>Services & Pricing</CardTitle>
              <CardDescription>
                Manage the services you offer and your pricing structure
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ServiceManagementPanel
            services={services.map(s => ({
              id: s.id,
              micro_service_id: s.micro_service_id,
              service_name: s.micro_service_id,
              is_active: s.is_active,
              service_areas: (Array.isArray(s.service_areas) ? s.service_areas : []) as string[],
              pricing_structure: s.pricing_structure
            }))}
            onAddService={handleAddService}
            onEditService={handleEditService}
            onDeleteService={deleteService}
            onToggleActive={toggleActive}
          />

          <ServiceManagementModal
            open={showServiceModal}
            onClose={() => setShowServiceModal(false)}
            onSave={handleSaveService}
            editingService={editingService}
          />
        </CardContent>
      </Card>

      {/* Professional Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Profile</CardTitle>
          <CardDescription>
            Your bio, rates, and expertise
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Describe your professional background, experience, and what makes you unique..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourly-rate">Hourly Rate (€)</Label>
            <Input
              id="hourly-rate"
              type="number"
              min="0"
              step="5"
              value={profile.hourly_rate || ''}
              onChange={(e) => setProfile({ ...profile, hourly_rate: Number(e.target.value) })}
              placeholder="50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Skills (comma-separated)</Label>
            <Input
              id="skills"
              value={profile.skills.join(', ')}
              onChange={(e) => setProfile({ 
                ...profile, 
                skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
              })}
              placeholder="e.g., Plumbing, Electrical, Carpentry"
            />
          </div>

          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            <div>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Company details, VAT, and legal information
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business-name">Business Name (Optional)</Label>
            <Input
              id="business-name"
              value={profile.business_name}
              onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
              placeholder="Your Company Ltd."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vat-number">VAT Number (Optional)</Label>
            <Input
              id="vat-number"
              value={profile.vat_number}
              onChange={(e) => setProfile({ ...profile, vat_number: e.target.value })}
              placeholder="ES12345678"
            />
          </div>

          <Button onClick={handleSave} disabled={loading} variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save Business Info
          </Button>
        </CardContent>
      </Card>

      {/* Portfolio */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            <div>
              <CardTitle>Portfolio</CardTitle>
              <CardDescription>
                Showcase your work with photos (minimum 3 recommended)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm font-medium mb-2">
              {isDragActive ? 'Drop images here...' : 'Drag & drop images here'}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              or click to select files (JPG, PNG, WEBP)
            </p>
            <Button type="button" variant="outline" disabled={uploadingImages}>
              {uploadingImages ? 'Uploading...' : 'Select Images'}
            </Button>
          </div>

          {/* Image Grid */}
          {profile.portfolio_images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {profile.portfolio_images.map((imageUrl, index) => (
                <div key={index} className="relative group aspect-square">
                  <img
                    src={imageUrl}
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleRemoveImage(imageUrl)}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {profile.portfolio_images.length === 0 && (
            <div className="text-center py-8 bg-muted/50 rounded-lg">
              <ImageIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No portfolio images yet. Upload at least 3 images to complete your profile.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
