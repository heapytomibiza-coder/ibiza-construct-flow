import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useCategories } from '@/hooks/useCategories';
import { useTranslation } from 'react-i18next';

interface JobFiltersProps {
  filters: {
    category: string;
    location: string;
    budgetRange: [number, number];
    urgent: boolean;
  };
  onFiltersChange: (filters: any) => void;
}

export function JobFilters({ filters, onFiltersChange }: JobFiltersProps) {
  const { t, i18n } = useTranslation('common');
  const { data: categories = [], isLoading } = useCategories();
  const isSpanish = i18n.language?.startsWith('es');

  // Get localized category name
  const getLocalizedName = (category: any) => {
    return isSpanish && category.name_es ? category.name_es : category.name;
  };

  return (
    <Card className="p-6 mb-6">
      <h3 className="font-semibold mb-4">{t('filters')}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Category */}
        <div className="space-y-2">
          <Label>{t('category', 'Category')}</Label>
          <Select
            value={filters.category}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, category: value })
            }
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('allCategories', 'All categories')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allCategories', 'All Categories')}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.icon_emoji && `${category.icon_emoji} `}
                  {getLocalizedName(category)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label>{t('location', 'Location')}</Label>
          <Input
            placeholder={t('enterCityOrArea', 'Enter city or area')}
            value={filters.location}
            onChange={(e) =>
              onFiltersChange({ ...filters, location: e.target.value })
            }
          />
        </div>

        {/* Budget Range */}
        <div className="space-y-2">
          <Label>
            {t('budget', 'Budget')}: €{filters.budgetRange[0]} - €{filters.budgetRange[1]}
          </Label>
          <Slider
            value={filters.budgetRange}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, budgetRange: value as [number, number] })
            }
            min={0}
            max={10000}
            step={100}
          />
        </div>
      </div>
    </Card>
  );
}
