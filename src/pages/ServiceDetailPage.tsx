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
import { ServiceMenuSection } from '@/components/services/ServiceMenuSection';
import { QuoteBasket } from '@/components/services/QuoteBasket';
import { useQuoteBasket } from '@/hooks/useQuoteBasket';
import { ArrowLeft, Shield, ChevronRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import type { ServiceMenuItem } from '@/types/services';

export default function ServiceDetailPage() {
  const { id: serviceId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  
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
        .select('id, full_name, avatar_url')
        .eq('id', professionalId!)
        .single();
      
      if (error) throw error;
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

      await supabase.from('activity_feed').insert({
        user_id: professionalId,
        event_type: 'quote_request_received',
        entity_type: 'quote_request',
        entity_id: quoteRequest.id,
        title: 'New Quote Request',
        description: `${basketItems.length} service(s) requested. Estimated total: €${totalEstimate.toFixed(2)}`,
        action_url: `/jobs/${job.id}`,
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

        {/* Portfolio Gallery */}
        {portfolioImages.length > 0 && (
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
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{service.name}</h1>
                  <p className="text-muted-foreground">{service.category}</p>
                </div>
                <Badge variant="secondary">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified Professional
                </Badge>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {professional && (
                  <div className="flex items-center">
                    <span className="font-medium">{professional.display_name || professional.full_name}</span>
                  </div>
                )}
              </div>
            </div>

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

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Service Menu</h3>
                  {totalItems > 0 && (
                    <span className="text-sm text-muted-foreground lg:hidden">
                      {totalItems} in quote
                    </span>
                  )}
                </div>

                {isLoadingMenu && (
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-44" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                )}

                {!isLoadingMenu && serviceMenuItems.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    The professional hasn't configured their menu yet. Check back soon for available options.
                  </p>
                )}

                {!isLoadingMenu &&
                  Object.entries(groupedItems).map(([groupName, items]) => (
                    <ServiceMenuSection
                      key={groupName}
                      groupName={groupName}
                      items={items}
                      onAddToBasket={handleAddToBasket}
                    />
                  ))}
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
