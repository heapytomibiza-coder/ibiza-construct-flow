import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCategories } from '@/hooks/useCategories';
import { getCategoryIcon } from '@/lib/categoryIcons';

const SpecialistCategories = () => {
  const navigate = useNavigate();
  const { data: categories = [], isLoading, error } = useCategories();

  // Filter specialist categories (PROFESSIONAL and SERVICES groups)
  const specialistCategories = categories.filter(cat => 
    cat.category_group === 'PROFESSIONAL' || cat.category_group === 'SERVICES'
  );

  const handleCategorySelect = (category: any) => {
    navigate(`/post-job?category=${category.slug}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-16">
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <p className="text-destructive">Failed to load categories</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Header Section */}
        <section className="bg-gradient-card py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/post')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Job Posting
              </Button>
            </div>
            
            <div className="text-center">
              <h1 className="text-display text-4xl md:text-6xl font-bold text-charcoal mb-6">
                Specialist Categories
              </h1>
              <p className="text-body text-xl text-muted-foreground max-w-3xl mx-auto">
                Professional and technical services for complex projects requiring specialized expertise
              </p>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {specialistCategories.map((category) => {
                const IconComponent = getCategoryIcon(category.icon_name || 'Wrench');
                return (
                  <Card 
                    key={category.id}
                    className="p-6 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
                    onClick={() => handleCategorySelect(category)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        {category.icon_emoji ? (
                          <span className="text-2xl">{category.icon_emoji}</span>
                        ) : (
                          <IconComponent className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                        )}
                        {category.examples && category.examples.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Examples: {category.examples.slice(0, 3).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SpecialistCategories;