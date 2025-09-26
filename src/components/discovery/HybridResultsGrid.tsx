import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EnhancedServiceCard } from '@/components/services/EnhancedServiceCard';
import EnhancedProfessionalCard from '@/components/professionals/EnhancedProfessionalCard';
import { MobileServiceCard } from '@/components/mobile/MobileServiceCard';
import { MobileProfessionalCard } from '@/components/mobile/MobileProfessionalCard';
import { SkeletonLoader } from '@/components/loading/SkeletonLoader';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFeature } from '@/contexts/FeatureFlagsContext';
import { cn } from '@/lib/utils';

export type DiscoveryMode = 'services' | 'professionals' | 'both';

interface HybridResultsGridProps {
  mode: DiscoveryMode;
  searchTerm: string;
  services: any[];
  professionals: any[];
  loading: boolean;
  showFilters: boolean;
}

export const HybridResultsGrid = ({
  mode,
  searchTerm,
  services,
  professionals,
  loading,
  showFilters
}: HybridResultsGridProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation('services');
  const isMobile = useIsMobile();
  const jobWizardEnabled = useFeature('ff.jobWizardV2');

  // Filter and combine results based on search term
  const filteredResults = useMemo(() => {
    const filterBySearch = (items: any[], searchField: string[]) => {
      if (!searchTerm.trim()) return items;
      const lowerSearchTerm = searchTerm.toLowerCase();
      return items.filter(item => 
        searchField.some(field => 
          item[field]?.toLowerCase().includes(lowerSearchTerm)
        )
      );
    };

    const filteredServices = filterBySearch(services, ['title', 'description', 'category', 'micro']);
    const filteredProfessionals = filterBySearch(professionals, ['full_name', 'display_name', 'bio', 'specializations']);

    switch (mode) {
      case 'services':
        return { services: filteredServices, professionals: [] };
      case 'professionals':
        return { services: [], professionals: filteredProfessionals };
      case 'both':
        // Interleave services and professionals for a mixed view
        const mixed = [];
        const maxLength = Math.max(filteredServices.length, filteredProfessionals.length);
        for (let i = 0; i < maxLength; i++) {
          if (i < filteredServices.length) mixed.push({ type: 'service', data: filteredServices[i] });
          if (i < filteredProfessionals.length) mixed.push({ type: 'professional', data: filteredProfessionals[i] });
        }
        return { mixed, services: filteredServices, professionals: filteredProfessionals };
      default:
        return { services: filteredServices, professionals: filteredProfessionals };
    }
  }, [mode, searchTerm, services, professionals]);

  const handleServiceClick = (service: any) => {
    if (jobWizardEnabled) {
      navigate(`/post?service=${encodeURIComponent(service.title)}&category=${encodeURIComponent(service.category)}`);
    } else {
      navigate(`/service/${service.slug}`);
    }
  };

  const handleProfessionalClick = (professional: any) => {
    navigate(`/professional/${professional.id}`);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <SkeletonLoader key={i} variant="card" />
        ))}
      </div>
    );
  }

  // Render results based on mode
  const renderResults = () => {
    if (mode === 'both' && filteredResults.mixed) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResults.mixed.map((item, index) => (
            <div key={`${item.type}-${item.data.id}-${index}`}>
              {item.type === 'service' ? (
                isMobile ? (
                  <MobileServiceCard
                    service={item.data}
                    onViewService={() => handleServiceClick(item.data)}
                    onBookNow={() => handleServiceClick(item.data)}
                  />
                ) : (
                  <EnhancedServiceCard
                    service={item.data}
                    onViewService={() => handleServiceClick(item.data)}
                    onBookNow={() => handleServiceClick(item.data)}
                  />
                )
              ) : (
                isMobile ? (
                  <MobileProfessionalCard
                    professional={item.data}
                    onViewProfile={() => handleProfessionalClick(item.data)}
                    onContact={() => handleProfessionalClick(item.data)}
                  />
                ) : (
                  <EnhancedProfessionalCard
                    professional={item.data}
                  />
                )
              )}
            </div>
          ))}
        </div>
      );
    }

    // Render services only
    if (mode === 'services' || (mode === 'both' && filteredResults.services.length > 0)) {
      return (
        <div className="space-y-8">
          {(mode === 'both') && (
            <div className="border-b border-border pb-4">
              <h3 className="text-2xl font-semibold text-foreground">Services</h3>
              <p className="text-muted-foreground">{filteredResults.services.length} services found</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.services.map((service) => (
              <div key={service.id}>
                {isMobile ? (
                  <MobileServiceCard
                    service={service}
                    onViewService={() => handleServiceClick(service)}
                    onBookNow={() => handleServiceClick(service)}
                  />
                ) : (
                  <EnhancedServiceCard
                    service={service}
                    onViewService={() => handleServiceClick(service)}
                    onBookNow={() => handleServiceClick(service)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Render professionals only
    if (mode === 'professionals' || (mode === 'both' && filteredResults.professionals.length > 0)) {
      return (
        <div className="space-y-8">
          {(mode === 'both') && (
            <div className="border-b border-border pb-4">
              <h3 className="text-2xl font-semibold text-foreground">Professionals</h3>
              <p className="text-muted-foreground">{filteredResults.professionals.length} professionals found</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.professionals.map((professional) => (
              <div key={professional.id}>
                {isMobile ? (
                  <MobileProfessionalCard
                    professional={professional}
                    onViewProfile={() => handleProfessionalClick(professional)}
                    onContact={() => handleProfessionalClick(professional)}
                  />
                ) : (
                  <EnhancedProfessionalCard
                    professional={professional}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  // Check if no results
  const hasResults = () => {
    if (mode === 'services') return filteredResults.services.length > 0;
    if (mode === 'professionals') return filteredResults.professionals.length > 0;
    if (mode === 'both') return filteredResults.mixed && filteredResults.mixed.length > 0;
    return false;
  };

  if (!hasResults()) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">
          {searchTerm ? 
            `No results found for "${searchTerm}"` : 
            'No results available'
          }
        </p>
      </div>
    );
  }

  return (
    <div className={cn("transition-all duration-300", showFilters && "blur-sm")}>
      {renderResults()}
    </div>
  );
};