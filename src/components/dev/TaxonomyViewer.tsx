/**
 * Category Taxonomy Viewer
 * Development tool to visualize the 14-category hybrid taxonomy
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ChevronRight } from 'lucide-react';
import { useCategories, useSubcategories, useMicroCategories } from '@/hooks/useCategories';
import { getCategoryIcon } from '@/lib/categoryIcons';

export const TaxonomyViewer: React.FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('');

  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: subcategories = [], isLoading: subcategoriesLoading } = useSubcategories(selectedCategoryId);
  const { data: microCategories = [], isLoading: microCategoriesLoading } = useMicroCategories(selectedSubcategoryId);

  // Group categories by type
  const coreCategories = categories.filter(cat => 
    ['STRUCTURAL', 'MEP', 'FINISHES', 'EXTERIOR', 'SERVICES'].includes(cat.category_group || '')
  );
  const specialistCategories = categories.filter(cat => 
    cat.category_group === 'PROFESSIONAL'
  );

  const renderCategoryCard = (category: any) => {
    const IconComponent = getCategoryIcon(category.icon_name || 'Wrench');
    const isSelected = selectedCategoryId === category.id;

    return (
      <Card 
        key={category.id}
        className={`cursor-pointer transition-all ${isSelected ? 'border-primary border-2' : 'hover:border-primary/50'}`}
        onClick={() => {
          setSelectedCategoryId(category.id);
          setSelectedSubcategoryId('');
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
              {category.icon_emoji ? (
                <span className="text-2xl">{category.icon_emoji}</span>
              ) : (
                <IconComponent className="h-6 w-6 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">{category.name}</CardTitle>
              <Badge variant="secondary" className="mt-1">
                {category.category_group}
              </Badge>
            </div>
          </div>
        </CardHeader>
        {category.description && (
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">{category.description}</p>
            {category.examples && category.examples.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Ex: {category.examples.slice(0, 2).join(', ')}
              </p>
            )}
          </CardContent>
        )}
      </Card>
    );
  };

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Taxonomy Viewer</h2>
          <p className="text-muted-foreground">
            Explore the 14-category hybrid taxonomy system
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">
            Total: {categories.length} categories
          </Badge>
          <Badge variant="outline">
            Core: {coreCategories.length}
          </Badge>
          <Badge variant="outline">
            Specialist: {specialistCategories.length}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Categories</TabsTrigger>
          <TabsTrigger value="core">Core Trades ({coreCategories.length})</TabsTrigger>
          <TabsTrigger value="specialist">Specialist ({specialistCategories.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(renderCategoryCard)}
          </div>
        </TabsContent>

        <TabsContent value="core" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coreCategories.map(renderCategoryCard)}
          </div>
        </TabsContent>

        <TabsContent value="specialist" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {specialistCategories.map(renderCategoryCard)}
          </div>
        </TabsContent>
      </Tabs>

      {/* Subcategories Panel */}
      {selectedCategoryId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChevronRight className="h-5 w-5" />
              Subcategories ({subcategories.length})
            </CardTitle>
            <CardDescription>
              {categories.find(c => c.id === selectedCategoryId)?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subcategoriesLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {subcategories.map(sub => (
                  <Button
                    key={sub.id}
                    variant={selectedSubcategoryId === sub.id ? 'default' : 'outline'}
                    className="justify-start"
                    onClick={() => setSelectedSubcategoryId(sub.id)}
                  >
                    {sub.name}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Micro Categories Panel */}
      {selectedSubcategoryId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChevronRight className="h-5 w-5" />
              <ChevronRight className="h-5 w-5 -ml-3" />
              Micro-Services ({microCategories.length})
            </CardTitle>
            <CardDescription>
              {subcategories.find(s => s.id === selectedSubcategoryId)?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {microCategoriesLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div className="flex flex-wrap gap-2">
                {microCategories.map(micro => (
                  <Badge key={micro.id} variant="secondary">
                    {micro.name}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
