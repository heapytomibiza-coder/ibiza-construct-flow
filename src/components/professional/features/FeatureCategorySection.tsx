import { ReactNode } from 'react';

interface FeatureCategorySectionProps {
  icon: string;
  title: string;
  children: ReactNode;
  columns?: number;
}

export function FeatureCategorySection({ 
  icon, 
  title, 
  children,
  columns = 3
}: FeatureCategorySectionProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <div className={`grid ${gridCols[columns as keyof typeof gridCols]} gap-4`}>
        {children}
      </div>
    </div>
  );
}
