import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  MapPin, Star, Clock, CheckCircle, Phone, Mail, 
  ShoppingCart, Plus, DollarSign, Minus
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { SkeletonLoader } from '@/components/loading/SkeletonLoader';
import { useBookingCart } from '@/contexts/BookingCartContext';

interface Professional {
  id: string;
  full_name: string;
}

interface ServiceItem {
  id: string;
  name: string;
  description: string | null;
  base_price: number | null;
  pricing_type: string;
  estimated_duration_minutes: number | null;
  primary_image_url?: string;
  is_active: boolean;
}

const ProfessionalMenuBoard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addItem, items } = useBookingCart();
  
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnits, setSelectedUnits] = useState<Record<string, string>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        // Fetch professional profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('id', id)
          .single();

        if (profileError) throw profileError;
        setProfessional(profileData);

        // Fetch professional's services
        const { data: servicesData, error: servicesError } = await supabase
          .from('professional_service_items')
          .select('*')
          .eq('professional_id', id)
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (servicesError) throw servicesError;
        setServices(servicesData || []);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load professional information');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddToCart = (service: ServiceItem) => {
    const unit = selectedUnits[service.id] || 'fixed';
    const quantity = unit === 'fixed' ? 1 : (quantities[service.id] || 1);
    const serviceName = unit === 'fixed' 
      ? `${service.name} (Fixed Rate)` 
      : `${service.name} (${quantity} ${unit})`;
    
    addItem({
      id: service.id,
      professionalId: id!,
      professionalName: professional?.full_name || 'Professional',
      serviceName: serviceName,
      pricePerUnit: service.base_price || 0,
      pricingType: service.pricing_type as any,
      quantity: quantity,
      unitType: unit,
    });
    
    const message = unit === 'fixed' 
      ? 'Added fixed rate service to request'
      : `Added ${quantity} ${unit} to request`;
    toast.success(message);
  };

  const handleUnitChange = (serviceId: string, unit: string) => {
    setSelectedUnits(prev => ({ ...prev, [serviceId]: unit }));
  };

  const handleQuantityChange = (serviceId: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[serviceId] || 1;
      const newValue = Math.max(1, current + delta);
      return { ...prev, [serviceId]: newValue };
    });
  };

  const formatPrice = (service: ServiceItem) => {
    if (!service.base_price) return 'Quote Required';
    
    const price = `$${service.base_price}`;
    if (service.pricing_type === 'per_hour') return `${price}/hr`;
    if (service.pricing_type === 'per_unit') return `${price}/unit`;
    return price;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <SkeletonLoader variant="card" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Professional Not Found</h1>
          <Button onClick={() => navigate('/discovery')}>Back to Discovery</Button>
        </main>
        <Footer />
      </div>
    );
  }

  const cartItemsCount = items.length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Professional Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="text-3xl">{professional.full_name?.[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{professional.full_name}</h1>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">4.8</span>
                      <span>(127 reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Verified Professional</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>Local area</span>
                    </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Menu */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Services Menu</h2>
            {cartItemsCount > 0 && (
              <Button onClick={() => navigate('/book')} size="lg">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Request Booking ({cartItemsCount})
              </Button>
            )}
          </div>

          {services.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No services available yet
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 space-y-4">
                    {service.primary_image_url && (
                      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                        <img 
                          src={service.primary_image_url} 
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{service.name}</h3>
                      {service.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {service.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3 pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-lg font-bold text-primary">
                            {service.base_price && <DollarSign className="w-4 h-4" />}
                            {formatPrice(service)}
                          </div>
                          {service.estimated_duration_minutes && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {service.estimated_duration_minutes} min
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {/* Quantity Controls - Hidden for Fixed Rate */}
                        {(selectedUnits[service.id] !== 'fixed') && (
                          <div className="flex items-center border rounded-md">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0"
                              onClick={() => handleQuantityChange(service.id, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="px-3 text-sm font-medium min-w-[2rem] text-center">
                              {quantities[service.id] || 1}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0"
                              onClick={() => handleQuantityChange(service.id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        )}

                        {/* Unit Selector */}
                        <Select 
                          value={selectedUnits[service.id] || 'fixed'}
                          onValueChange={(value) => handleUnitChange(service.id, value)}
                        >
                          <SelectTrigger className={selectedUnits[service.id] === 'fixed' ? 'flex-1' : 'w-32'}>
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed">Fixed Rate</SelectItem>
                            <SelectItem value="hours">Hours</SelectItem>
                            <SelectItem value="days">Days</SelectItem>
                            <SelectItem value="weeks">Weeks</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {/* Add Button */}
                        <Button 
                          onClick={() => handleAddToCart(service)}
                          size="sm"
                          className="px-4"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Floating Cart Button (Mobile) */}
        {cartItemsCount > 0 && (
          <div className="fixed bottom-6 right-6 md:hidden z-50">
            <Button 
              onClick={() => navigate('/book')}
              size="lg"
              className="rounded-full shadow-lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {cartItemsCount}
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProfessionalMenuBoard;
