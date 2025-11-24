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
import { ArrowLeft, Shield } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import type { ServiceMenuItem } from '@/types/services';

export default function ServiceDetailPage() {
  const { id: serviceId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

  const { data: service, isLoading } = useQuery({
    queryKey: ['service-detail', serviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professional_service_items')
        .select(`
          id,
          name,
          description,
          category,
          professional_id,
          profiles!professional_service_items_professional_id_fkey (
            id,
            full_name,
            display_name,
            avatar_url
          )
        `)
        .eq('id', serviceId!)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!serviceId,
  });

  const { data: serviceMenuItems = [], isLoading: isLoadingMenu } = useQuery({
    queryKey: ['service-menu-items', serviceId],
    queryFn: async () => {
      const { data, error } = await supabase
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
          sort_order
        `)
        .eq('id', serviceId!);

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
      })) as ServiceMenuItem[];
    },
    enabled: !!serviceId,
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
      title: 'Añadido al presupuesto',
      description: `${item.name} se ha añadido a tu selección`,
    });
  };

  const handleRequestQuote = async () => {
    if (!serviceId || !basketItems.length) {
      toast({
        title: 'Añade servicios',
        description: 'Selecciona al menos un elemento para solicitar un presupuesto.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmittingQuote(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const clientId = userData?.user?.id;

      if (!clientId) {
        toast({
          title: 'Inicia sesión',
          description: 'Debes iniciar sesión para solicitar un presupuesto.',
          variant: 'destructive',
        });
        navigate('/auth');
        return;
      }

      // For now, just store quote request metadata
      // TODO: Integrate with proper job creation flow
      toast({
        title: 'Función en desarrollo',
        description: 'La solicitud de presupuestos múltiples estará disponible próximamente.',
      });

      clearBasket();
      setIsBasketOpen(false);
    } catch (error) {
      console.error('[quote_request]', error);
      toast({
        title: 'No se pudo enviar la solicitud',
        description: 'Inténtalo de nuevo o revisa tu conexión.',
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
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

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
                  Profesional Verificado
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
                  <h3 className="text-xl font-semibold">Menú de servicios</h3>
                  {totalItems > 0 && (
                    <span className="text-sm text-muted-foreground lg:hidden">
                      {totalItems} en presupuesto
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
                    El profesional aún no ha configurado su menú. Vuelve pronto para ver las opciones disponibles.
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
            <SheetTitle>Tu presupuesto</SheetTitle>
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
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Fixed Bottom Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-4 left-0 right-0 px-4 lg:hidden">
          <div className="bg-background border shadow-lg rounded-full px-4 py-3 flex items-center justify-between max-w-md mx-auto">
            <div>
              <p className="text-sm font-semibold">{totalItems} tarea(s) seleccionadas</p>
              <p className="text-xs text-muted-foreground">{totalEstimate.toFixed(2)} €</p>
            </div>
            <Button size="sm" onClick={() => setIsBasketOpen(true)}>
              Ver presupuesto
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
