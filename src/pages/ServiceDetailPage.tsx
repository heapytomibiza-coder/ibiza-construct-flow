import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useToast } from '@/components/ui/use-toast';
import { EnhancedServiceMenuItemCard } from '@/components/services/EnhancedServiceMenuItemCard';
import { QuoteBasket } from '@/components/services/QuoteBasket';
import { ServicePortfolioGallery } from '@/components/services/ServicePortfolioGallery';
import { ServiceMaterialSelector } from '@/components/services/ServiceMaterialSelector';
import { ServicePricingAddons } from '@/components/services/ServicePricingAddons';
import { useQuoteBasket } from '@/hooks/useQuoteBasket';
import { useServiceMaterials } from '@/hooks/useServiceMaterials';
import { useServicePricingAddons } from '@/hooks/useServicePricingAddons';
import { useServicePortfolio } from '@/hooks/useServicePortfolio';
import { useReviewSystem } from '@/hooks/useReviewSystem';
import { RatingDisplay } from '@/components/reviews/RatingDisplay';
import { logActivity } from '@/lib/logActivity';
import { ArrowLeft, Shield, ChevronRight, Award, Clock, CheckCircle, Star } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import type { ServiceMenuItem } from '@/types/services';

export default function ServiceDetailPage() {
  const { id: serviceId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [adjustedPrice, setAdjustedPrice] = useState<number>(0);
  
  const searchParams = new URLSearchParams(window.location.search);
  const filterByProfessional = searchParams.get('professional');

  const { data: service, isLoading } = useQuery({
    queryKey: ['service-detail', serviceId, filterByProfessional],
    queryFn: async () => {
      let query = supabase
        .from('professional_service_items')
        .select(`
          id,
          name,
          description,
          category,
          professional_id,
          service_id,
          profiles!professional_service_items_professional_id_fkey (
            id,
            full_name,
            display_name,
            avatar_url
          )
        `)
        .eq('service_id', serviceId!);
      
      if (filterByProfessional) {
        query = query.eq('professional_id', filterByProfessional);
      }
      
      const { data, error } = await query.limit(1).maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!serviceId,
  });

  const { data: serviceMenuItems = [], isLoading: isLoadingMenu } = useQuery({
    queryKey: ['service-menu-items', serviceId, filterByProfessional],
    queryFn: async () => {
      let query = supabase
        .from('professional_service_items')
        .select(`
          id,
          name,
          description,
          long_description,
          base_price,
          pricing_type,
          unit_type,
          group_name,
          whats_included,
          specifications,
          sort_order,
          professional_id
        `)
        .eq('service_id', serviceId!)
        .eq('is_active', true);

      if (filterByProfessional) {
        query = query.eq('professional_id', filterByProfessional);
      }

      const { data, error } = await query.order('group_name').order('sort_order');

      if (error) throw error;

      return ((data || []) as any[]).map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        long_description: item.long_description,
        price: item.base_price || 0,
        pricing_type: item.pricing_type || 'fixed',
        unit_label: item.unit_type || 'unidad',
        group_name: item.group_name || 'General Services',
        whats_included: Array.isArray(item.whats_included) ? item.whats_included : [],
        specifications: typeof item.specifications === 'object' ? item.specifications : {},
        professional_id: item.professional_id,
      })) as ServiceMenuItem[];
    },
    enabled: !!serviceId,
  });

  const professionalId = useMemo(() => {
    if (!serviceMenuItems.length) return service?.professional_id || null;
    return (serviceMenuItems[0] as any).professional_id;
  }, [serviceMenuItems, service]);

  const { data: professionalProfile } = useQuery({
    queryKey: ['professional-profile', professionalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          full_name, 
          display_name,
          avatar_url,
          bio
        `)
        .eq('id', professionalId!)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!professionalId,
  });

  const { data: professionalStats } = useQuery({
    queryKey: ['professional-stats', professionalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('user_id', professionalId!)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!professionalId,
  });

  const { data: portfolioImages = [] } = useQuery({
    queryKey: ['portfolio-images', professionalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_images')
        .select('*')
        .eq('professional_id', professionalId!)
        .in('category', ['metalwork', 'gates'])
        .order('display_order')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!professionalId,
  });

  const { overallRating, totalReviews } = useReviewSystem(professionalId || undefined);

  // Get the first service item ID for fetching materials/addons/portfolio
  const firstServiceItemId = useMemo(() => serviceMenuItems[0]?.id, [serviceMenuItems]);

  // Fetch service-specific data
  const { data: serviceMaterials = [] } = useServiceMaterials(firstServiceItemId || '');
  const { data: servicePricingAddons = [] } = useServicePricingAddons(firstServiceItemId || '');
  const { data: servicePortfolio } = useServicePortfolio(firstServiceItemId || '');

  const {
    items: basketItems,
    notes,
    setNotes,
    totalEstimate,
    totalItems,
    addItem,
    updateQuantity,
    removeItem,
    clearBasket,
  } = useQuoteBasket(serviceId || 'service');

  const groupedItems = useMemo(() => {
    return (serviceMenuItems || []).reduce((groups, item) => {
      const key = item.group_name || 'Servicios';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    }, {} as Record<string, ServiceMenuItem[]>);
  }, [serviceMenuItems]);

  const handleAddToBasket = (item: ServiceMenuItem, quantity: number) => {
    addItem(
      {
        serviceItemId: item.id,
        name: item.name,
        pricePerUnit:
          item.pricing_type === 'quote_required' || item.pricing_type === 'range'
            ? 0
            : item.price || 0,
        pricingType: item.pricing_type,
        unitLabel: item.unit_label || 'unidad',
      },
      quantity
    );

    toast({
      title: 'Added to Quote',
      description: `${item.name} has been added to your selection`,
    });
  };

  const handleRequestQuote = async () => {
    if (!serviceId || !professionalId) return;

    if (!basketItems.length) {
      toast({
        title: 'Add Services',
        description: 'Select at least one item to request a quote.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmittingQuote(true);

    try {
      const { data: userData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !userData?.user) {
        toast({
          title: 'Please Sign In',
          description: 'Sign in to request a quote.',
          variant: 'destructive',
        });
        navigate('/auth?redirect=' + encodeURIComponent(window.location.pathname));
        return;
      }

      const clientId = userData.user.id;

      const jobTitle = basketItems.length === 1
        ? `Quote Request: ${basketItems[0].name}`
        : `Quote Request: ${basketItems.length} services`;

      const jobDescription = notes 
        ? `${notes}\n\nRequested services:\n${basketItems.map(item => `- ${item.name} (x${item.quantity})`).join('\n')}`
        : `Requested services:\n${basketItems.map(item => `- ${item.name} (x${item.quantity})`).join('\n')}`;

      const jobPayload = {
        client_id: clientId,
        micro_id: serviceId,
        title: jobTitle,
        description: jobDescription,
        status: 'open' as const,
        answers: {
          quote_notes: notes,
          service_id: serviceId,
          basket_items: basketItems,
          total_estimate: totalEstimate,
        } as any,
      };

      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .insert(jobPayload as any)
        .select('id');

      if (jobError || !jobData?.[0]) throw jobError;
      const job = jobData[0];

      const { data: quoteData, error: quoteError } = await supabase
        .from('quote_requests')
        .insert({
          job_id: job.id,
          professional_id: professionalId,
          notes,
          status: 'pending',
        })
        .select('id');

      if (quoteError || !quoteData?.[0]) throw quoteError;
      const quoteRequest = quoteData[0];

      const itemsPayload = basketItems.map((item) => ({
        quote_request_id: quoteRequest.id,
        service_item_id: item.serviceItemId,
        quantity: item.quantity,
        unit_price: item.pricePerUnit,
        subtotal: item.subtotal,
      }));

      const { error: itemsError } = await supabase
        .from('quote_request_items')
        .insert(itemsPayload);

      if (itemsError) throw itemsError;

      await logActivity({
        userId: professionalId,
        eventType: 'quote_request_received',
        entityType: 'quote_request',
        entityId: quoteRequest.id,
        title: 'New Quote Request',
        description: `${basketItems.length} service(s) requested. Estimated total: €${totalEstimate.toFixed(2)}`,
        actionUrl: `/jobs/${job.id}`,
      });

      toast({
        title: 'Request Sent',
        description: 'The professional will review your request and respond soon.',
      });

      clearBasket();
      setIsBasketOpen(false);
      navigate(`/jobs/${job.id}`);
    } catch (error) {
      console.error('[quote_request]', error);
      toast({
        title: 'Could Not Send Request',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  useEffect(() => {
    if (service) {
      document.title = `${service.name} | TaskMasters Ibiza`;
    }
  }, [service]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 pt-32">
          <Skeleton className="h-8 w-24 mb-6" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-96 w-full rounded-lg" />
              <Skeleton className="h-40 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 pt-32">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Service not found</p>
              <Button onClick={() => navigate('/discovery')} className="mt-4">
                Back to Discovery
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const professional = service.profiles;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{service.name} | TaskMasters Ibiza</title>
        <meta name="description" content={service.description || `Professional ${service.name} service`} />
      </Helmet>

      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-32">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Button
            variant="link"
            onClick={() => filterByProfessional ? navigate(`/professionals/${filterByProfessional}`) : navigate(-1)}
            className="p-0 h-auto font-normal hover:text-foreground"
          >
            {professionalProfile?.full_name || 'Professional'}
          </Button>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{service.category || service.name}</span>
        </div>

        {/* Hero Section with Professional Branding */}
        <Card className="mb-6 overflow-hidden">
          <div className="relative h-48 md:h-64 bg-gradient-to-br from-primary/20 via-primary/10 to-background">
            {portfolioImages[0]?.image_url && (
              <img 
                src={portfolioImages[0].image_url} 
                alt={service.name}
                className="absolute inset-0 w-full h-full object-cover opacity-40"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            <div className="relative h-full flex items-end p-6 md:p-8">
              <div className="flex items-center gap-4">
                {professionalProfile?.avatar_url && (
                  <img 
                    src={professionalProfile.avatar_url} 
                    alt={professionalProfile.full_name}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-background object-cover"
                  />
                )}
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold mb-1">{service.name}</h1>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <span className="font-medium">{professionalProfile?.display_name || professionalProfile?.full_name}</span>
                    <Badge variant="secondary" className="ml-2">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Trust Indicators */}
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {overallRating && (
                <div className="flex flex-col items-center gap-1">
                  <RatingDisplay 
                    rating={overallRating} 
                    count={totalReviews}
                    size="lg"
                  />
                </div>
              )}
              
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1 text-lg font-bold">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  87
                </div>
                <p className="text-xs text-muted-foreground">Projects completed</p>
              </div>
              
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1 text-lg font-bold">
                  <Clock className="h-4 w-4 text-primary" />
                  2h
                </div>
                <p className="text-xs text-muted-foreground">Response time</p>
              </div>
              
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1 text-lg font-bold">
                  <Award className="h-4 w-4 text-primary" />
                  8+
                </div>
                <p className="text-xs text-muted-foreground">Years experience</p>
              </div>
            </div>
            
            {professionalProfile?.bio && (
              <p className="mt-4 text-sm text-muted-foreground border-t pt-4">
                {professionalProfile.bio}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Service-Specific Portfolio Gallery */}
        {servicePortfolio?.portfolioImages && servicePortfolio.portfolioImages.length > 0 && (
          <div className="mb-6">
            <ServicePortfolioGallery
              images={servicePortfolio.portfolioImages}
              serviceName={service.name}
            />
          </div>
        )}

        {/* Professional Portfolio Gallery (fallback) */}
        {(!servicePortfolio?.portfolioImages || servicePortfolio.portfolioImages.length === 0) && portfolioImages.length > 0 && (
          <Card className="mb-6 overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-4">
                {portfolioImages.slice(0, 8).map((img, idx) => (
                  <div key={img.id} className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer">
                    <img 
                      src={img.image_url} 
                      alt={img.title || 'Portfolio image'}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <div className="text-white text-sm">
                        <p className="font-semibold">{img.title}</p>
                        {img.description && <p className="text-xs opacity-90 mt-1">{img.description}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {portfolioImages.length > 8 && (
                <div className="px-4 pb-4">
                  <Button variant="outline" className="w-full" onClick={() => navigate(`/professionals/${professionalId}`)}>
                    View All {portfolioImages.length} Projects
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] gap-8">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Service Description */}
            {service.description && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Material Selector */}
            {serviceMaterials.length > 0 && (
              <ServiceMaterialSelector
                materials={serviceMaterials}
                selectedMaterial={selectedMaterial}
                onSelectMaterial={setSelectedMaterial}
              />
            )}

            {/* Dynamic Pricing Add-ons */}
            {servicePricingAddons.length > 0 && firstServiceItemId && (
              <ServicePricingAddons
                addons={servicePricingAddons}
                basePrice={serviceMenuItems[0]?.price || 0}
                onSelectionChange={(addons, total, quantity) => {
                  setSelectedAddons(addons);
                  setAdjustedPrice(total);
                }}
              />
            )}

            {/* Service Menu with Enhanced Cards */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Available Services</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select services to add to your quote request
                  </p>
                </div>
                {totalItems > 0 && (
                  <Badge variant="default" className="lg:hidden">
                    {totalItems} selected
                  </Badge>
                )}
              </div>

              {isLoadingMenu && (
                <div className="space-y-4">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-48 w-full rounded-lg" />
                </div>
              )}

              {!isLoadingMenu && serviceMenuItems.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      The professional hasn't configured their menu yet. Check back soon for available options.
                    </p>
                  </CardContent>
                </Card>
              )}

              {!isLoadingMenu && Object.entries(groupedItems).map(([groupName, items]) => (
                <div key={groupName} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                    <h4 className="text-lg font-semibold px-4">{groupName}</h4>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                  </div>
                  <div className="grid gap-4">
                    {items.map((item) => (
                      <EnhancedServiceMenuItemCard
                        key={item.id}
                        item={item}
                        onAddToBasket={(qty) => handleAddToBasket(item, qty)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Trust & Guarantee Section */}
            <Card className="bg-gradient-to-br from-primary/5 to-background border-primary/20">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Our Commitment to Quality</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Quality Guarantee</h4>
                      <p className="text-sm text-muted-foreground">
                        All work comes with comprehensive warranty coverage and quality assurance
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Satisfaction Promise</h4>
                      <p className="text-sm text-muted-foreground">
                        We work until you're completely satisfied with the results
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">On-Time Delivery</h4>
                      <p className="text-sm text-muted-foreground">
                        Projects completed within agreed timelines or your money back
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Licensed & Insured</h4>
                      <p className="text-sm text-muted-foreground">
                        Fully certified professionals with comprehensive liability insurance
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Quote Basket (Desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <QuoteBasket
                items={basketItems}
                notes={notes}
                onNotesChange={setNotes}
                totalEstimate={totalEstimate}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
                onRequestQuote={handleRequestQuote}
                isSubmitting={isSubmittingQuote}
                professionalName={professionalProfile?.full_name}
                professionalAvatar={professionalProfile?.avatar_url}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Mobile Quote Basket Drawer */}
      <Sheet open={isBasketOpen} onOpenChange={setIsBasketOpen}>
        <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Your Quote</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <QuoteBasket
              items={basketItems}
              notes={notes}
              onNotesChange={setNotes}
              totalEstimate={totalEstimate}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
              onRequestQuote={handleRequestQuote}
              isSubmitting={isSubmittingQuote}
              professionalName={professionalProfile?.full_name}
              professionalAvatar={professionalProfile?.avatar_url}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Fixed Bottom Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-4 left-0 right-0 px-4 lg:hidden">
          <div className="bg-background border shadow-lg rounded-full px-4 py-3 flex items-center justify-between max-w-md mx-auto">
            <div>
              <p className="text-sm font-semibold">{totalItems} item(s) selected</p>
              <p className="text-xs text-muted-foreground">€{totalEstimate.toFixed(2)}</p>
            </div>
            <Button size="sm" onClick={() => setIsBasketOpen(true)}>
              View Quote
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
