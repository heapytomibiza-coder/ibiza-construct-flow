import { useEffect, useState } from 'react';
import { Hammer, Wrench, Paintbrush, Zap, Droplet, Package, Building2, Ruler, Home } from 'lucide-react';
import { QuickSelectionChips } from '@/components/services/QuickSelectionChips';
import { supabase } from '@/integrations/supabase/client';

interface SkillsChipsProps {
  selectedOptions: string[];
  onSelectionChange: (options: string[]) => void;
}

const categoryIcons: Record<string, any> = {
  'Electrician': <Zap className="w-4 h-4" />,
  'Carpenter': <Hammer className="w-4 h-4" />,
  'Plumber': <Droplet className="w-4 h-4" />,
  'Builder': <Building2 className="w-4 h-4" />,
  'Architects & Design': <Ruler className="w-4 h-4" />,
  'Commercial Projects': <Building2 className="w-4 h-4" />,
  'Flooring Specialist': <Package className="w-4 h-4" />,
  'Floors, Doors & Windows': <Home className="w-4 h-4" />,
  'Bricklayer/Mason': <Wrench className="w-4 h-4" />,
  'Painter': <Paintbrush className="w-4 h-4" />,
};

export const SkillsChips = ({ selectedOptions, onSelectionChange }: SkillsChipsProps) => {
  const [categories, setCategories] = useState<Array<{ id: string; label: string; icon?: React.ReactNode; popular?: boolean }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('services_micro')
          .select('category')
          .order('category');

        if (error) throw error;

        // Get unique categories
        const uniqueCategories = Array.from(new Set(data?.map(item => item.category) || []));
        
        // Map to chip format
        const categoryOptions = uniqueCategories.map(cat => ({
          id: cat,
          label: cat,
          icon: categoryIcons[cat],
          popular: ['Builder', 'Electrician', 'Carpenter'].includes(cat)
        }));

        setCategories(categoryOptions);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="p-6 card-luxury rounded-lg">
        <p className="text-muted-foreground">Loading services...</p>
      </div>
    );
  }

  return (
    <QuickSelectionChips
      title="Your Skills & Services"
      subtitle="Select the main service categories you offer"
      options={categories}
      selectedOptions={selectedOptions}
      onSelectionChange={onSelectionChange}
      multiSelect={true}
    />
  );
};