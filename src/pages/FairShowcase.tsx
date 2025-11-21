/**
 * Fair Showcase Page
 * Landing page for Ibiza Home Meeting 2025
 * Displays all sector categories with demo profiles
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as LucideIcons from 'lucide-react';
import { QRCodeGenerator } from '@/components/fair/QRCodeGenerator';
import { FairStats } from '@/components/fair/FairStats';

interface FairSector {
  slug: string;
  name_es: string;
  name_en: string;
  icon: string;
  description_es: string;
  description_en: string;
  display_order: number;
}

export default function FairShowcase() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  // Fetch all fair sectors
  const { data: sectors, isLoading: sectorsLoading } = useQuery({
    queryKey: ['fair-sectors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fair_sectors')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return data as FairSector[];
    },
  });

  // Fetch demo profiles
  const { data: demoProfiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['demo-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professional_profiles')
        .select(`
          *,
          user:profiles!professional_profiles_user_id_fkey(
            full_name,
            avatar_url
          ),
          stats:professional_stats(*)
        `)
        .eq('is_demo_profile', true)
        .contains('featured_at_events', ['ibiza-home-meeting-2025']);
      
      if (error) throw error;
      return data;
    },
  });

  const getSectorProfile = (sectorSlug: string) => {
    return demoProfiles?.find(profile => 
      (profile.subsector_tags as string[])?.includes(sectorSlug) ||
      profile.business_name?.toLowerCase().includes(sectorSlug.replace('-', ' '))
    );
  };

  const getIconComponent = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="h-8 w-8" /> : <LucideIcons.Building className="h-8 w-8" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-4 text-lg px-6 py-2" variant="secondary">
            Ibiza Home Meeting 2025
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {language === 'es' 
              ? 'Tu empresa en nuestra plataforma'
              : 'Your Company on Our Platform'}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            {language === 'es'
              ? 'Descubre cómo tu empresa aparecería en Constructive Solutions Ibiza. Explora ejemplos de cada sector.'
              : 'Discover how your company would appear on Constructive Solutions Ibiza. Explore examples from each sector.'}
          </p>
          
          <div className="flex gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              onClick={() => navigate('/fair/onboarding')}
              className="text-lg px-8"
            >
              {language === 'es' ? 'Crear Mi Perfil' : 'Create My Profile'}
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            >
              {language === 'es' ? 'EN' : 'ES'}
            </Button>
          </div>

          <FairStats />
        </div>
      </section>

      {/* Sectors Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="all">
                {language === 'es' ? 'Todos los Sectores' : 'All Sectors'}
              </TabsTrigger>
              <TabsTrigger value="favorites">
                {language === 'es' ? 'Mis Favoritos' : 'My Favorites'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {sectorsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(9)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-8 w-8 bg-muted rounded mb-2" />
                        <div className="h-6 bg-muted rounded w-3/4" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-4 bg-muted rounded w-full mb-2" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sectors?.map((sector) => {
                    const profile = getSectorProfile(sector.slug);
                    return (
                      <Card 
                        key={sector.slug} 
                        className="hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
                        onClick={() => {
                          if (profile) {
                            navigate(`/professionals/${profile.user_id}`);
                          }
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="p-3 rounded-lg bg-primary/10 text-primary mb-4">
                              {getIconComponent(sector.icon)}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSector(sector.slug);
                              }}
                            >
                              <LucideIcons.QrCode className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <CardTitle className="text-xl">
                            {language === 'es' ? sector.name_es : sector.name_en}
                          </CardTitle>
                          <CardDescription>
                            {language === 'es' ? sector.description_es : sector.description_en}
                          </CardDescription>
                        </CardHeader>

                        <CardContent>
                          {profile ? (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">{profile.business_name}</p>
                              <Badge variant="secondary">
                                {language === 'es' ? 'Ver Ejemplo' : 'View Example'}
                              </Badge>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              {language === 'es' ? 'Próximamente' : 'Coming Soon'}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="favorites">
              <div className="text-center py-12">
                <LucideIcons.Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">
                  {language === 'es' 
                    ? 'Marca tus sectores favoritos para verlos aquí'
                    : 'Mark your favorite sectors to see them here'}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {language === 'es'
              ? '¿Listo para unirte a la plataforma?'
              : 'Ready to join the platform?'}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {language === 'es'
              ? 'Crea tu perfil en 3 minutos y empieza a recibir solicitudes de proyectos.'
              : 'Create your profile in 3 minutes and start receiving project requests.'}
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/fair/onboarding')}
            className="text-lg px-12"
          >
            {language === 'es' ? 'Comenzar Ahora' : 'Start Now'}
          </Button>
        </div>
      </section>

      {/* QR Code Dialog */}
      {selectedSector && sectors && (
        <QRCodeGenerator
          sector={sectors.find(s => s.slug === selectedSector)!}
          open={!!selectedSector}
          onClose={() => setSelectedSector(null)}
          language={language}
        />
      )}
    </div>
  );
}
