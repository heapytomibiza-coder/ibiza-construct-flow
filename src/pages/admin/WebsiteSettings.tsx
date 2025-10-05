import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function WebsiteSettings() {
  const queryClient = useQueryClient();

  // Fetch all site settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('section');
      if (error) throw error;
      return data;
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ section, key, value }: { section: string; key: string; value: any }) => {
      const { error } = await supabase
        .from('site_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('section', section)
        .eq('key', key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Settings updated successfully');
    },
    onError: () => {
      toast.error('Failed to update settings');
    },
  });

  const getSetting = (section: string, key: string) => {
    return settings?.find((s) => s.section === section && s.key === key)?.value;
  };

  const handleUpdate = (section: string, key: string, value: any) => {
    updateMutation.mutate({ section, key, value });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Website Content Management</h1>
        <p className="text-muted-foreground">Manage frontend content and layout settings</p>
      </div>

      <Tabs defaultValue="hero" className="space-y-4">
        <TabsList>
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="homepage">Homepage Layout</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section Content</CardTitle>
              <CardDescription>Edit hero section text and statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <HeroEditor settings={getSetting} onUpdate={handleUpdate} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Footer Content</CardTitle>
              <CardDescription>Manage footer information and links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FooterEditor settings={getSetting} onUpdate={handleUpdate} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="homepage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Homepage Layout</CardTitle>
              <CardDescription>Control section visibility and features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <HomepageEditor settings={getSetting} onUpdate={handleUpdate} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function HeroEditor({ settings, onUpdate }: any) {
  const [stats, setStats] = useState(settings('hero', 'stats') || {});
  const [badge, setBadge] = useState(settings('hero', 'badge') || '');
  const [title, setTitle] = useState(settings('hero', 'title') || '');
  const [subtitle, setSubtitle] = useState(settings('hero', 'subtitle') || '');
  const [description, setDescription] = useState(settings('hero', 'description') || '');

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Badge Text</Label>
        <Input
          value={badge}
          onChange={(e) => setBadge(e.target.value)}
          placeholder="Ibiza's #1 Rated Network"
        />
        <Button onClick={() => onUpdate('hero', 'badge', badge)} size="sm">
          Update Badge
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Main Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Building the Island."
        />
        <Button onClick={() => onUpdate('hero', 'title', title)} size="sm">
          Update Title
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Subtitle</Label>
        <Input
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Building Your Dreams."
        />
        <Button onClick={() => onUpdate('hero', 'subtitle', subtitle)} size="sm">
          Update Subtitle
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Connect with Ibiza's most trusted..."
          rows={3}
        />
        <Button onClick={() => onUpdate('hero', 'description', description)} size="sm">
          Update Description
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="text-lg font-semibold">Statistics</Label>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Verified Pros</Label>
            <Input
              value={stats.pros || ''}
              onChange={(e) => setStats({ ...stats, pros: e.target.value })}
              placeholder="500+"
            />
          </div>
          <div>
            <Label>Projects Done</Label>
            <Input
              value={stats.projects || ''}
              onChange={(e) => setStats({ ...stats, projects: e.target.value })}
              placeholder="2000+"
            />
          </div>
          <div>
            <Label>Protected Value</Label>
            <Input
              value={stats.protected || ''}
              onChange={(e) => setStats({ ...stats, protected: e.target.value })}
              placeholder="€20M+"
            />
          </div>
        </div>
        <Button onClick={() => onUpdate('hero', 'stats', stats)} size="sm">
          Update Stats
        </Button>
      </div>
    </div>
  );
}

function FooterEditor({ settings, onUpdate }: any) {
  const [contact, setContact] = useState(settings('footer', 'contact') || {});
  const [social, setSocial] = useState(settings('footer', 'social') || {});
  const [brand, setBrand] = useState(settings('footer', 'brand') || {});

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-lg font-semibold">Brand Information</Label>
        <div className="space-y-2">
          <Input
            value={brand.name || ''}
            onChange={(e) => setBrand({ ...brand, name: e.target.value })}
            placeholder="CS Ibiza"
          />
          <Input
            value={brand.tagline || ''}
            onChange={(e) => setBrand({ ...brand, tagline: e.target.value })}
            placeholder="Elite Network"
          />
          <Textarea
            value={brand.description || ''}
            onChange={(e) => setBrand({ ...brand, description: e.target.value })}
            placeholder="Company description..."
            rows={2}
          />
        </div>
        <Button onClick={() => onUpdate('footer', 'brand', brand)} size="sm">
          Update Brand
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="text-lg font-semibold">Contact Information</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Address</Label>
            <Input
              value={contact.address || ''}
              onChange={(e) => setContact({ ...contact, address: e.target.value })}
              placeholder="Ibiza, Balearic Islands, Spain"
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={contact.phone || ''}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              placeholder="+34 971 XXX XXX"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              value={contact.email || ''}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
              placeholder="hello@csibiza.com"
            />
          </div>
        </div>
        <Button onClick={() => onUpdate('footer', 'contact', contact)} size="sm">
          Update Contact
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="text-lg font-semibold">Social Media Links</Label>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Facebook</Label>
            <Input
              value={social.facebook || ''}
              onChange={(e) => setSocial({ ...social, facebook: e.target.value })}
              placeholder="https://facebook.com/..."
            />
          </div>
          <div>
            <Label>Instagram</Label>
            <Input
              value={social.instagram || ''}
              onChange={(e) => setSocial({ ...social, instagram: e.target.value })}
              placeholder="https://instagram.com/..."
            />
          </div>
          <div>
            <Label>LinkedIn</Label>
            <Input
              value={social.linkedin || ''}
              onChange={(e) => setSocial({ ...social, linkedin: e.target.value })}
              placeholder="https://linkedin.com/..."
            />
          </div>
        </div>
        <Button onClick={() => onUpdate('footer', 'social', social)} size="sm">
          Update Social
        </Button>
      </div>
    </div>
  );
}

function HomepageEditor({ settings, onUpdate }: any) {
  const [layout, setLayout] = useState(settings('homepage', 'layout') || {});

  const handleToggle = (key: string, value: boolean) => {
    const newLayout = { ...layout, [key]: value };
    setLayout(newLayout);
    onUpdate('homepage', 'layout', newLayout);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Benefits Strip</Label>
          <p className="text-sm text-muted-foreground">Show the benefits strip section</p>
        </div>
        <Switch
          checked={layout.showBenefitsStrip || false}
          onCheckedChange={(checked) => handleToggle('showBenefitsStrip', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Featured Services Carousel</Label>
          <p className="text-sm text-muted-foreground">Show the featured services carousel</p>
        </div>
        <Switch
          checked={layout.showCarousel || false}
          onCheckedChange={(checked) => handleToggle('showCarousel', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Testing Banner</Label>
          <p className="text-sm text-muted-foreground">Show testing/development banner</p>
        </div>
        <Switch
          checked={layout.showTestingBanner || false}
          onCheckedChange={(checked) => handleToggle('showTestingBanner', checked)}
        />
      </div>
    </div>
  );
}
