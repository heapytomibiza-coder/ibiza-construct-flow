/**
 * Infer category from job title keywords
 * Temporary fallback until category_slug is stored on jobs
 * 
 * @module categoryInference
 */

export interface InferredCategory {
  name: string;
  slug: string;
}

/**
 * Mapping of keywords to categories
 * Order matters: more specific keywords should come first
 */
const CATEGORY_KEYWORDS: Record<string, InferredCategory> = {
  'kitchen': { name: 'Kitchen & Bathroom', slug: 'kitchen-bathroom' },
  'bathroom': { name: 'Kitchen & Bathroom', slug: 'kitchen-bathroom' },
  'electrical': { name: 'Electrical', slug: 'electrical' },
  'lighting': { name: 'Electrical', slug: 'electrical' },
  'painting': { name: 'Painting & Decorating', slug: 'painting-decorating' },
  'deck': { name: 'Carpentry', slug: 'carpentry' },
  'pergola': { name: 'Carpentry', slug: 'carpentry' },
  'lawn': { name: 'Gardening & Landscaping', slug: 'gardening-landscaping' },
  'garden': { name: 'Gardening & Landscaping', slug: 'gardening-landscaping' },
  'landscaping': { name: 'Gardening & Landscaping', slug: 'gardening-landscaping' },
  'pool': { name: 'Pool & Spa', slug: 'pool-spa' },
  'window': { name: 'Floors, Doors & Windows', slug: 'floors-doors-windows' },
  'door': { name: 'Floors, Doors & Windows', slug: 'floors-doors-windows' },
  'floor': { name: 'Floors, Doors & Windows', slug: 'floors-doors-windows' },
  'plumbing': { name: 'Plumbing', slug: 'plumbing' },
  'pipe': { name: 'Plumbing', slug: 'plumbing' },
  'construction': { name: 'Construction', slug: 'construction' },
  'renovation': { name: 'Construction', slug: 'construction' },
  'facade': { name: 'Construction', slug: 'construction' },
  'roof': { name: 'Construction', slug: 'construction' },
};

/**
 * Infer category from job title using keyword matching
 * Returns null if no match found
 * 
 * @param title - Job title to analyze
 * @returns Inferred category with name and slug, or null
 */
export function inferCategoryFromTitle(title: string): InferredCategory | null {
  if (!title) return null;
  const titleLower = title.toLowerCase();
  
  for (const [keyword, category] of Object.entries(CATEGORY_KEYWORDS)) {
    if (titleLower.includes(keyword)) return category;
  }
  return null;
}

/**
 * Get just the category name from a title
 * Convenience wrapper for simpler use cases
 * 
 * @param title - Job title to analyze
 * @returns Category name or null
 */
export function inferCategoryNameFromTitle(title: string): string | null {
  return inferCategoryFromTitle(title)?.name ?? null;
}
