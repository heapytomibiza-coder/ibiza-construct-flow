import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, ChevronLeft } from 'lucide-react';

type ServiceMicro = {
  id: string;
  category: string;
  subcategory: string;
  micro: string;
};

type CascaderOutput = {
  id: string;
  category: string;
  subcategory: string;
  microservice: string;
  micro: string;
};

interface CascaderProps {
  onChange: (selection: CascaderOutput) => void;
  placeholder?: string;
  className?: string;
}

export default function Cascader({ onChange, placeholder = "Select a service", className = "" }: CascaderProps) {
  const [services, setServices] = useState<ServiceMicro[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Cache services in localStorage for performance
  const cacheKey = 'cascader_services_cache';
  const cacheTimeout = 5 * 60 * 1000; // 5 minutes

  const fetchServices = async () => {
    try {
      // Try to load from cache first
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < cacheTimeout) {
          setServices(data);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await supabase
        .from('services_unified_v1')
        .select('id, category, subcategory, micro')
        .order('category')
        .order('subcategory')
        .order('micro');

      if (error) throw error;
      
      setServices(data || []);
      
      // Cache the data
      localStorage.setItem(cacheKey, JSON.stringify({
        data: data || [],
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const getCategories = () => {
    const categories = [...new Set(services.map(s => s.category))];
    return categories.filter(cat =>
      !searchTerm || cat.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getSubcategories = (category: string) => {
    const subcategories = [...new Set(
      services
        .filter(s => s.category === category)
        .map(s => s.subcategory)
    )];
    return subcategories.filter(sub =>
      !searchTerm || sub.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getMicroservices = (category: string, subcategory: string) => {
    return services
      .filter(s => s.category === category && s.subcategory === subcategory)
      .filter(s =>
        !searchTerm || s.micro.toLowerCase().includes(searchTerm.toLowerCase())
      );
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setSearchTerm('');
  };

  const handleSubcategorySelect = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
    setSearchTerm('');
  };

  const handleMicroserviceSelect = (microservice: ServiceMicro) => {
    onChange({
      id: microservice.id,
      category: microservice.category,
      subcategory: microservice.subcategory,
      microservice: microservice.micro,
      micro: microservice.micro
    });
  };

  const handleBack = () => {
    if (selectedSubcategory) {
      setSelectedSubcategory(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
    setSearchTerm('');
  };

  const getBreadcrumb = () => {
    const parts = [];
    if (selectedCategory) parts.push(selectedCategory);
    if (selectedSubcategory) parts.push(selectedSubcategory);
    return parts.join(' > ');
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-2 gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Breadcrumb */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {(selectedCategory || selectedSubcategory) && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="h-8 px-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Badge variant="outline" className="text-xs">
              {getBreadcrumb()}
            </Badge>
          </div>
        )}
      </div>

      {/* Categories */}
      {!selectedCategory && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Categories</h3>
          <div className="grid grid-cols-2 gap-2">
            {getCategories().slice(0, 8).map((category) => (
              <Button
                key={category}
                variant="outline"
                onClick={() => handleCategorySelect(category)}
                className="h-auto p-3 text-left justify-start"
              >
                <div>
                  <div className="font-medium text-sm">{category}</div>
                  <div className="text-xs text-muted-foreground">
                    {services.filter(s => s.category === category).length} services
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Subcategories */}
      {selectedCategory && !selectedSubcategory && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            {selectedCategory} Services
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {getSubcategories(selectedCategory).map((subcategory) => (
              <Button
                key={subcategory}
                variant="outline"
                onClick={() => handleSubcategorySelect(subcategory)}
                className="h-auto p-3 text-left justify-start"
              >
                <div>
                  <div className="font-medium text-sm">{subcategory}</div>
                  <div className="text-xs text-muted-foreground">
                    {services.filter(s => 
                      s.category === selectedCategory && s.subcategory === subcategory
                    ).length} options
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Microservices */}
      {selectedCategory && selectedSubcategory && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            {selectedSubcategory} Options
          </h3>
          <div className="space-y-2">
            {getMicroservices(selectedCategory, selectedSubcategory).map((microservice) => (
              <Button
                key={microservice.id}
                variant="outline"
                onClick={() => handleMicroserviceSelect(microservice)}
                className="w-full h-auto p-3 text-left justify-start"
              >
                <div>
                  <div className="font-medium text-sm">{microservice.micro}</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedCategory} • {selectedSubcategory}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {searchTerm && (
        (selectedCategory ? getMicroservices(selectedCategory, selectedSubcategory || '') : getCategories()).length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No services found for "{searchTerm}"</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm('')}
              className="mt-2"
            >
              Clear search
            </Button>
          </div>
        )
      )}
    </div>
  );
}