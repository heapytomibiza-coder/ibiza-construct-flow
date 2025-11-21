/**
 * Service Configuration Review Component
 * Final review before saving configured services
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pencil, Trash2, DollarSign, Clock, Calendar, Briefcase } from "lucide-react";

interface ConfiguredService {
  micro_service_id: string;
  micro_service_name: string;
  category_name: string;
  subcategory_name: string;
  pricing_type: 'hourly' | 'daily' | 'job';
  rate: number;
  description?: string;
}

interface Props {
  services: ConfiguredService[];
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  onConfirm: () => void;
  onBack: () => void;
  loading?: boolean;
}

export function ServiceConfigurationReview({ 
  services, 
  onEdit, 
  onRemove, 
  onConfirm, 
  onBack,
  loading 
}: Props) {
  // Group services by category
  const groupedServices = services.reduce((acc, service, index) => {
    const category = service.category_name;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ ...service, originalIndex: index });
    return acc;
  }, {} as Record<string, Array<ConfiguredService & { originalIndex: number }>>);

  // Calculate statistics
  const stats = {
    totalServices: services.length,
    categories: Object.keys(groupedServices).length,
    avgHourlyRate: services.filter(s => s.pricing_type === 'hourly').length > 0
      ? Math.round(services.filter(s => s.pricing_type === 'hourly').reduce((sum, s) => sum + s.rate, 0) / 
          services.filter(s => s.pricing_type === 'hourly').length)
      : null,
    avgDailyRate: services.filter(s => s.pricing_type === 'daily').length > 0
      ? Math.round(services.filter(s => s.pricing_type === 'daily').reduce((sum, s) => sum + s.rate, 0) / 
          services.filter(s => s.pricing_type === 'daily').length)
      : null,
    jobBasedCount: services.filter(s => s.pricing_type === 'job').length,
  };

  const getPricingIcon = (type: string) => {
    switch (type) {
      case 'hourly': return <Clock className="h-4 w-4" />;
      case 'daily': return <Calendar className="h-4 w-4" />;
      case 'job': return <Briefcase className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const formatPricing = (service: ConfiguredService) => {
    const currency = '€';
    switch (service.pricing_type) {
      case 'hourly':
        return `${currency}${service.rate}/hr`;
      case 'daily':
        return `${currency}${service.rate}/day`;
      case 'job':
        return `${currency}${service.rate}/job`;
      default:
        return `${currency}${service.rate}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Review Your Services</h2>
        <p className="text-muted-foreground mt-1">
          Review all configured services before finalizing. You can edit or remove any service.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">{stats.totalServices}</div>
            <p className="text-xs text-muted-foreground">Total Services</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">{stats.categories}</div>
            <p className="text-xs text-muted-foreground">Categories</p>
          </CardContent>
        </Card>
        {stats.avgHourlyRate && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-foreground">€{stats.avgHourlyRate}</div>
              <p className="text-xs text-muted-foreground">Avg Hourly Rate</p>
            </CardContent>
          </Card>
        )}
        {stats.avgDailyRate && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-foreground">€{stats.avgDailyRate}</div>
              <p className="text-xs text-muted-foreground">Avg Daily Rate</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Services List */}
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-6">
          {Object.entries(groupedServices).map(([category, categoryServices]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold text-foreground mb-3">{category}</h3>
              <div className="space-y-3">
                {categoryServices.map((service) => (
                  <Card key={service.originalIndex} className="border-border/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            {service.micro_service_name}
                            <Badge variant="outline" className="ml-2">
                              <span className="flex items-center gap-1">
                                {getPricingIcon(service.pricing_type)}
                                {formatPricing(service)}
                              </span>
                            </Badge>
                          </CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {service.subcategory_name}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(service.originalIndex)}
                            className="h-8 w-8"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemove(service.originalIndex)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {service.description && (
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="flex-1"
        >
          Back to Configuration
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading || services.length === 0}
          className="flex-1"
        >
          {loading ? 'Saving...' : `Confirm & Save ${services.length} Service${services.length !== 1 ? 's' : ''}`}
        </Button>
      </div>
    </div>
  );
}
