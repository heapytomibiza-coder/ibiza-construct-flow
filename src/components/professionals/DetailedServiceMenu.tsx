import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Euro, 
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Check,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ServiceItem {
  id: string;
  service_id: string;
  name?: string;
  description?: string;
  long_description?: string;
  base_price?: number;
  pricing_type?: string;
  unit_type?: string;
  category?: string;
  group_name?: string;
  whats_included?: string[];
  specifications?: Record<string, any>;
  estimated_duration_minutes?: number;
  is_active: boolean;
}

interface DetailedServiceMenuProps {
  services: ServiceItem[];
  professionalId?: string;
  onRequestQuote?: (serviceId: string) => void;
}

export const DetailedServiceMenu = ({ services, professionalId, onRequestQuote }: DetailedServiceMenuProps) => {
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const activeServices = services.filter(s => s.is_active);
  
  // Group services by category or group_name
  const groupedServices = activeServices.reduce((acc, service) => {
    const group = service.group_name || service.category || 'Services';
    if (!acc[group]) acc[group] = [];
    acc[group].push(service);
    return acc;
  }, {} as Record<string, ServiceItem[]>);

  const categories = Object.keys(groupedServices);
  const filteredGroups = selectedCategory 
    ? { [selectedCategory]: groupedServices[selectedCategory] }
    : groupedServices;

  if (activeServices.length === 0) {
    return null;
  }

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const formatPrice = (service: ServiceItem) => {
    if (!service.base_price) return 'Quote Required';
    const price = `€${service.base_price.toFixed(0)}`;
    const unit = service.unit_type ? `/${service.unit_type}` : '';
    return `${price}${unit}`;
  };

  const getSpecifications = (service: ServiceItem) => {
    if (!service.specifications || typeof service.specifications !== 'object') return [];
    return Object.entries(service.specifications)
      .filter(([_, value]) => value)
      .map(([key, value]) => ({
        label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: String(value)
      }));
  };

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="text-center space-y-3">
          <h2 className="text-4xl font-bold tracking-tight">Detailed Service Menu</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transparent pricing with full specifications for every service
          </p>
        </div>

        {/* Category Filter Pills */}
        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="rounded-full"
            >
              All Services
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="rounded-full"
              >
                {category} ({groupedServices[category].length})
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Grouped Service Items */}
      {Object.entries(filteredGroups).map(([groupName, groupServices], groupIndex) => (
        <motion.div
          key={groupName}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: groupIndex * 0.1 }}
          className="space-y-4"
        >
          {/* Group Header */}
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold">{groupName}</h3>
            <div className="flex-1 h-px bg-border" />
            <Badge variant="secondary">{groupServices.length} items</Badge>
          </div>

          {/* Service Items Grid */}
          <div className="grid grid-cols-1 gap-4">
            {groupServices.map((service, index) => {
              const isExpanded = expandedItems.has(service.id);
              const specs = getSpecifications(service);
              const hasDetails = (service.whats_included && service.whats_included.length > 0) || specs.length > 0;

              return (
                <Card 
                  key={service.id}
                  className={cn(
                    "group overflow-hidden transition-all duration-300",
                    isExpanded ? "shadow-lg border-primary/50" : "hover:shadow-md"
                  )}
                >
                  <CardContent className="p-6">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-xl mb-1 group-hover:text-primary transition-colors">
                          {service.name}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {service.description}
                        </p>
                      </div>
                      
                      {/* Price Badge */}
                      <div className="flex flex-col items-end gap-2">
                        <Badge className="text-base font-bold px-3 py-1 bg-primary">
                          {formatPrice(service)}
                        </Badge>
                        {service.estimated_duration_minutes && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {Math.round(service.estimated_duration_minutes / 60)}h
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Long Description - Always Visible if Available */}
                    {service.long_description && !isExpanded && (
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed line-clamp-2">
                        {service.long_description}
                      </p>
                    )}

                    {/* Expanded Details */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 mt-4"
                      >
                        {/* Long Description */}
                        {service.long_description && (
                          <div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {service.long_description}
                            </p>
                          </div>
                        )}

                        {/* What's Included */}
                        {service.whats_included && service.whats_included.length > 0 && (
                          <div className="bg-muted/50 rounded-lg p-4">
                            <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <Check className="w-4 h-4 text-primary" />
                              What's Included:
                            </p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {service.whats_included.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <span className="text-primary mt-0.5">✓</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Specifications */}
                        {specs.length > 0 && (
                          <div className="bg-muted/30 rounded-lg p-4">
                            <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <Info className="w-4 h-4 text-primary" />
                              Specifications:
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {specs.map((spec, idx) => (
                                <div key={idx} className="text-xs">
                                  <span className="text-muted-foreground">{spec.label}:</span>
                                  <span className="ml-1 font-medium">{spec.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Action Row */}
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                      {hasDetails && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(service.id)}
                          className="gap-2"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Show Less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              View Details
                            </>
                          )}
                        </Button>
                      )}
                      
                      <div className="flex-1" />
                      
                      {onRequestQuote && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRequestQuote(service.id)}
                        >
                          Quick Quote
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        onClick={() => navigate(`/service/${service.service_id}${professionalId ? `?professional=${professionalId}` : ''}`)}
                        className="gap-2"
                      >
                        Full Menu
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>
      ))}
    </section>
  );
};
