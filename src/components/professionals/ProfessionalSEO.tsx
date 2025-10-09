import { Helmet } from 'react-helmet-async';

interface ProfessionalSEOProps {
  professionalName: string;
  professionalId: string;
  bio?: string;
  tagline?: string;
  rating?: number;
  totalReviews?: number;
  primaryTrade?: string;
  location?: string;
  imageUrl?: string;
}

export const ProfessionalSEO = ({
  professionalName,
  professionalId,
  bio,
  tagline,
  rating = 0,
  totalReviews = 0,
  primaryTrade,
  location = 'Ibiza',
  imageUrl
}: ProfessionalSEOProps) => {
  const title = `${professionalName} - ${primaryTrade || 'Professional'} in ${location}`;
  const description = tagline || bio?.substring(0, 160) || `Hire ${professionalName}, a trusted ${primaryTrade?.toLowerCase() || 'professional'} in ${location}. View reviews, portfolio, and get a free quote.`;
  const canonicalUrl = `${window.location.origin}/professionals/${professionalId}`;
  
  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: professionalName,
    description: description,
    image: imageUrl || `${window.location.origin}/placeholder.svg`,
    url: canonicalUrl,
    address: {
      '@type': 'PostalAddress',
      addressLocality: location,
      addressCountry: 'ES'
    },
    ...(rating > 0 && totalReviews > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating.toFixed(1),
        reviewCount: totalReviews,
        bestRating: '5',
        worstRating: '1'
      }
    }),
    ...(primaryTrade && {
      '@type': 'ProfessionalService',
      serviceType: primaryTrade
    })
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="profile" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {imageUrl && <meta property="og:image" content={imageUrl} />}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      {imageUrl && <meta property="twitter:image" content={imageUrl} />}

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};
