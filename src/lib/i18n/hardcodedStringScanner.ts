/**
 * Hardcoded String Scanner
 * Scans components for strings that should be translated
 */

// Patterns that indicate hardcoded strings needing translation
const TRANSLATABLE_PATTERNS = [
  // UI Labels
  /(?:title|label|placeholder|alt|aria-label)=["']([A-Z][^"']+)["']/g,
  // JSX text content (capitalized words)
  />([A-Z][a-zA-Z\s]+)</g,
  // Button/link text
  /<Button[^>]*>([A-Z][^<]+)</g,
  // Heading text
  /<h[1-6][^>]*>([^<]+)</g,
];

// Known translation key prefixes per page/component
export const PAGE_TRANSLATION_MAP: Record<string, string[]> = {
  'Discovery.tsx': ['discovery', 'pages.services', 'common'],
  'Index.tsx': ['hero', 'services', 'howItWorks', 'common'],
  'JobBoardPage.tsx': ['pages.jobBoard', 'common'],
  'BrowseProfessionalsPage.tsx': ['pages.professionals', 'common'],
  'Dashboard.tsx': ['dashboard', 'common'],
  'UnifiedAuth.tsx': ['auth', 'common'],
  'Header.tsx': ['navigation', 'common'],
  'Footer.tsx': ['footer', 'common'],
};

// Strings that are OK to be hardcoded (technical, brand names, etc.)
export const ALLOWED_HARDCODED = [
  'TM Direct',
  'CS Ibiza',
  'Ibiza',
  'EUR',
  'USD',
  'ID',
  'OK',
  'N/A',
  'API',
  'URL',
  'PDF',
  'AI',
];

// Common hardcoded strings found in components
export const COMMON_HARDCODED_STRINGS = {
  // Discovery page
  discovery: {
    'Find Your Perfect': 'discovery.hero.title',
    'Professional': 'discovery.hero.professional',
    'Browse premium services': 'discovery.hero.subtitle',
    'Services': 'discovery.tabs.services',
    'Professionals': 'discovery.tabs.professionals',
    'Verified Pros': 'discovery.stats.verifiedPros',
    'Avg Rating': 'discovery.stats.avgRating',
    'Response': 'discovery.stats.response',
    'Filters': 'discovery.filters.title',
    'Clear Filters': 'discovery.filters.clear',
  },
  // Index/Home page
  home: {
    'Professional Registration': 'home.professionalRegistration.title',
    'Step 1: Registration': 'home.professionalRegistration.step1',
    'Sign up as a professional': 'home.professionalRegistration.step1Desc',
    'Step 2: Verification': 'home.professionalRegistration.step2',
    'Upload documents': 'home.professionalRegistration.step2Desc',
    'Step 3: Services': 'home.professionalRegistration.step3',
    'Configure your offerings': 'home.professionalRegistration.step3Desc',
  },
  // Common UI
  common: {
    'Loading...': 'common.status.loading',
    'Saving...': 'common.status.saving',
    'Error': 'common.status.error',
    'Success': 'common.status.success',
    'Submit': 'common.actions.submit',
    'Cancel': 'common.actions.cancel',
    'Save': 'common.actions.save',
    'Edit': 'common.actions.edit',
    'Delete': 'common.actions.delete',
    'View': 'common.actions.view',
    'Search': 'common.actions.search',
    'Filter': 'common.actions.filter',
    'Back': 'common.actions.back',
    'Next': 'common.actions.next',
  },
};

export interface AuditResult {
  file: string;
  hardcodedStrings: string[];
  suggestedKeys: Record<string, string>;
  coverage: number;
}

export function getTranslationKeyForString(str: string, namespace: string): string | null {
  const namespaceMap = COMMON_HARDCODED_STRINGS[namespace as keyof typeof COMMON_HARDCODED_STRINGS];
  if (namespaceMap && namespaceMap[str as keyof typeof namespaceMap]) {
    return namespaceMap[str as keyof typeof namespaceMap];
  }
  return null;
}

// Generate a suggested translation key from a string
export function generateKeyFromString(str: string, prefix: string = ''): string {
  const key = str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .substring(0, 30);
  
  return prefix ? `${prefix}.${key}` : key;
}

// Check if a string should be translated
export function shouldTranslate(str: string): boolean {
  // Skip if too short
  if (str.length < 3) return false;
  
  // Skip if in allowed list
  if (ALLOWED_HARDCODED.some(allowed => str.includes(allowed))) return false;
  
  // Skip if looks like a URL, email, or technical string
  if (/^(https?:\/\/|mailto:|[\w.-]+@|[a-z_]+\.[a-z_]+)/.test(str)) return false;
  
  // Skip if looks like a CSS class or variable
  if (/^(text-|bg-|flex-|grid-|--|\$)/.test(str)) return false;
  
  // Skip numbers and single characters
  if (/^[\d\s.,€$%]+$/.test(str)) return false;
  
  return true;
}

export function logAuditReport(results: AuditResult[]): void {
  console.group('🔍 Hardcoded String Audit Report');
  
  let totalStrings = 0;
  let totalSuggested = 0;
  
  results.forEach(result => {
    if (result.hardcodedStrings.length > 0) {
      console.group(`📄 ${result.file} (${result.hardcodedStrings.length} strings)`);
      result.hardcodedStrings.forEach(str => {
        const suggested = result.suggestedKeys[str];
        if (suggested) {
          console.log(`  ❌ "${str}" → t('${suggested}')`);
          totalSuggested++;
        } else {
          console.log(`  ⚠️ "${str}" (no key suggestion)`);
        }
      });
      console.groupEnd();
      totalStrings += result.hardcodedStrings.length;
    }
  });
  
  console.log('\n📊 Summary:');
  console.log(`  Total hardcoded strings: ${totalStrings}`);
  console.log(`  With suggested keys: ${totalSuggested}`);
  console.log(`  Files analyzed: ${results.length}`);
  console.groupEnd();
}
