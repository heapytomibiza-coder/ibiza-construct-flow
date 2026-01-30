import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { PageLoader } from '@/components/common';
import Discovery from './Discovery';

/**
 * SEO-friendly service category landing page
 * Routes: /services/:categorySlug
 * Renders Discovery pre-filtered by category
 */
const ServiceCategoryPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();

  // Fetch category by slug
  const { data: category, isLoading, error } = useQuery({
    queryKey: ['service-category-by-slug', categorySlug],
    queryFn: async () => {
      if (!categorySlug) return null;
      
      const { data, error } = await supabase
        .from('service_categories')
        .select('id, name, slug, description')
        .eq('slug', categorySlug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!categorySlug,
    staleTime: 5 * 60 * 1000,
  });

  // If no slug provided, redirect to /services
  if (!categorySlug) {
    return <Navigate to="/services" replace />;
  }

  if (isLoading) {
    return <PageLoader />;
  }

  // If category not found, redirect to services
  if (error || !category) {
    return <Navigate to="/services" replace />;
  }

  // Generate SEO meta title and description
  const metaTitle = `${category.name} Services in Ibiza | CS Ibiza`;
  const metaDescription = category.description 
    || `Find trusted ${category.name.toLowerCase()} professionals in Ibiza. Compare quotes, reviews, and portfolios on CS Ibiza.`;

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={`${typeof window !== 'undefined' ? window.location.origin : ''}/services/${categorySlug}`} />
      </Helmet>
      
      {/* Pass category filter to Discovery */}
      <Discovery initialCategoryName={category.name} />
    </>
  );
};

export default ServiceCategoryPage;
