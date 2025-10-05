import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase, Building, Upload, Save } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ServiceManagementPanel } from '@/components/professional/ServiceManagementPanel';
import { useProfessionalServices } from '@/hooks/useProfessionalServices';

export default function ProfessionalSettings() {
  const { user } = useAuth();
  const { services, addService, updateService, deleteService, toggleActive } = useProfessionalServices(user?.id);
  
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    bio: '',
    hourly_rate: 0,
    business_name: '',
    vat_number: '',
    skills: [] as string[]
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('professional_profiles')
      .select('bio, hourly_rate, business_name, vat_number, skills')
      .eq('user_id', user.id)
      .single();

    if (data && !error) {
      setProfile({
        bio: data.bio || '',
        hourly_rate: data.hourly_rate || 0,
        business_name: data.business_name || '',
        vat_number: data.vat_number || '',
        skills: Array.isArray(data.skills) ? data.skills as string[] : []
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
            onAddService={() => toast.info('Service creation coming soon')}
            onEditService={(id) => toast.info('Service editing coming soon')}
            onDeleteService={deleteService}
            onToggleActive={toggleActive}
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
                Showcase your work with photos and case studies
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Upload photos of your completed projects to build trust with clients
          </p>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload Photos
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Portfolio upload functionality coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
