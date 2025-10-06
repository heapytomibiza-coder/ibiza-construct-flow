/**
 * SEO Metadata Management
 * Dynamic meta tags, Open Graph, and structured data
 */

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

/**
 * Update page metadata
 */
export function updateMetadata(metadata: PageMetadata): void {
  const { title, description, keywords, image, url, type, publishedTime, modifiedTime, author } = metadata;

  // Update title
  document.title = title;

  // Update or create meta tags
  updateMetaTag('description', description);
  
  if (keywords) {
    updateMetaTag('keywords', keywords.join(', '));
  }

  // Open Graph tags
  updateMetaTag('og:title', title, 'property');
  updateMetaTag('og:description', description, 'property');
  updateMetaTag('og:type', type || 'website', 'property');
  
  if (image) {
    updateMetaTag('og:image', image, 'property');
  }
  
  if (url) {
    updateMetaTag('og:url', url, 'property');
  }

  // Twitter Card tags
  updateMetaTag('twitter:card', 'summary_large_image');
  updateMetaTag('twitter:title', title);
  updateMetaTag('twitter:description', description);
  
  if (image) {
    updateMetaTag('twitter:image', image);
  }

  // Article metadata
  if (type === 'article') {
    if (publishedTime) {
      updateMetaTag('article:published_time', publishedTime, 'property');
    }
    if (modifiedTime) {
      updateMetaTag('article:modified_time', modifiedTime, 'property');
    }
    if (author) {
      updateMetaTag('article:author', author, 'property');
    }
  }

  // Canonical URL
  if (url) {
    updateLinkTag('canonical', url);
  }
}

/**
 * Update or create a meta tag
 */
function updateMetaTag(
  name: string,
  content: string,
  attribute: 'name' | 'property' = 'name'
): void {
  let element = document.querySelector(`meta[${attribute}="${name}"]`);
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}

/**
 * Update or create a link tag
 */
function updateLinkTag(rel: string, href: string): void {
  let element = document.querySelector(`link[rel="${rel}"]`);
  
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  
  element.setAttribute('href', href);
}

/**
 * Generate JSON-LD structured data
 */
export function generateStructuredData(data: any): void {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(data);
  
  // Remove existing structured data
  const existing = document.querySelector('script[type="application/ld+json"]');
  if (existing) {
    existing.remove();
  }
  
  document.head.appendChild(script);
}

/**
 * Create organization structured data
 */
export function createOrganizationSchema(org: {
  name: string;
  url: string;
  logo?: string;
  description?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
    url: org.url,
    logo: org.logo,
    description: org.description,
  };
}

/**
 * Create breadcrumb structured data
 */
export function createBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Default metadata
 */
export const defaultMetadata: PageMetadata = {
  title: 'Ibiza Build Flow - Professional Marketplace',
  description: 'Connect with skilled professionals in Ibiza for all your construction and service needs.',
  keywords: ['ibiza', 'construction', 'professionals', 'marketplace', 'services'],
  image: '/placeholder.svg',
  type: 'website',
};
