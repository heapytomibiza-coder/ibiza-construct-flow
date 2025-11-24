import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import type { ServiceMaterial } from '@/types/services';
import { cn } from '@/lib/utils';

interface ServiceMaterialSelectorProps {
  materials: ServiceMaterial[];
  selectedMaterial?: string;
  onSelectMaterial: (materialId: string) => void;
}

export const ServiceMaterialSelector = ({
  materials,
  selectedMaterial,
  onSelectMaterial,
}: ServiceMaterialSelectorProps) => {
  if (!materials || materials.length === 0) return null;

  // Group materials by category
  const groupedMaterials = materials.reduce((acc, material) => {
    if (!acc[material.material_category]) {
      acc[material.material_category] = [];
    }
    acc[material.material_category].push(material);
    return acc;
  }, {} as Record<string, ServiceMaterial[]>);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Materials & Finishes</h3>
      
      {Object.entries(groupedMaterials).map(([category, categoryMaterials]) => (
        <div key={category} className="mb-6 last:mb-0">
          <h4 className="text-sm font-medium text-muted-foreground uppercase mb-3">
            {category}
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categoryMaterials.map((material) => (
              <button
                key={material.id}
                onClick={() => onSelectMaterial(material.id)}
                className={cn(
                  "relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                  "hover:border-primary/50 hover:bg-accent/50",
                  selectedMaterial === material.id
                    ? "border-primary bg-accent"
                    : "border-border bg-card"
                )}
              >
                {selectedMaterial === material.id && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                )}
                
                <div className="text-2xl">
                  {material.material_icon ? (
                    <span>{material.material_icon}</span>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/20" />
                  )}
                </div>
                
                <span className="text-sm font-medium text-center">
                  {material.material_name}
                </span>
                
                {material.is_default && (
                  <Badge variant="secondary" className="text-xs">
                    Popular
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </Card>
  );
};
