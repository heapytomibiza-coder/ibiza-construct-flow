/**
 * Translation Audit Utility
 * Scans for hardcoded strings that should use i18n
 */

import i18n from '@/i18n';

// Known hardcoded string patterns that should be translated
export const COMMON_HARDCODED_PATTERNS = [
  // Dashboard tabs
  'Dashboard', 'Features', 'Analytics', 'Insights', 'AI',
  // Actions
  'Loading...', 'Saving...', 'Processing...', 'Submitting...',
  'No results', 'Not found', 'Error', 'Success',
  // Page titles
  'Booking Management', 'Contract Management', 'My Contracts',
  'Find Professionals', 'Professional Verifications', 'Admin Utilities',
  'Question Pack Management',
  // Status
  'Pending', 'Approved', 'Rejected', 'Active', 'Completed',
  // Common UI
  'View all', 'See more', 'Learn more', 'Get started',
  'Apply', 'Submit', 'Cancel', 'Save', 'Edit', 'Delete',
];

// Pages that MUST have full translation coverage
export const CRITICAL_PAGES = [
  '/', // Home
  '/discovery', // Service discovery
  '/post', // Job posting wizard
  '/login', '/signup', // Auth
  '/dashboard', // User dashboard
  '/job-board', // Job listings
  '/browse-professionals', // Find pros
];

// Check if a namespace has all required keys
export function checkNamespaceCoverage(namespace: string): {
  coverage: number;
  missingInEs: string[];
  missingInDe: string[];
  missingInFr: string[];
} {
  const enKeys = getNamespaceKeys(namespace, 'en');
  const esKeys = getNamespaceKeys(namespace, 'es');
  const deKeys = getNamespaceKeys(namespace, 'de');
  const frKeys = getNamespaceKeys(namespace, 'fr');

  const missingInEs = enKeys.filter(k => !esKeys.includes(k));
  const missingInDe = enKeys.filter(k => !deKeys.includes(k));
  const missingInFr = enKeys.filter(k => !frKeys.includes(k));

  const totalChecks = enKeys.length * 3; // 3 other languages
  const present = (esKeys.length + deKeys.length + frKeys.length);
  const coverage = totalChecks > 0 ? present / (enKeys.length * 3) : 1;

  return { coverage, missingInEs, missingInDe, missingInFr };
}

function getNamespaceKeys(namespace: string, lng: string): string[] {
  const resourceBundle = i18n.getResourceBundle(lng, namespace);
  if (!resourceBundle) return [];
  return flattenKeys(resourceBundle);
}

function flattenKeys(obj: any, prefix = ''): string[] {
  const keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys.push(...flattenKeys(obj[key], path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}

// Get full audit report
export function getTranslationAuditReport(): {
  namespaces: Array<{
    name: string;
    coverage: number;
    missingCount: { es: number; de: number; fr: number };
  }>;
  overallCoverage: number;
  recommendations: string[];
} {
  const namespaces = [
    'common', 'navigation', 'services', 'auth', 'dashboard', 
    'hero', 'components', 'howItWorks', 'footer', 'pages', 
    'wizard', 'admin', 'questions', 'discovery', 'home'
  ];

  const results = namespaces.map(ns => {
    const { coverage, missingInEs, missingInDe, missingInFr } = checkNamespaceCoverage(ns);
    return {
      name: ns,
      coverage,
      missingCount: {
        es: missingInEs.length,
        de: missingInDe.length,
        fr: missingInFr.length,
      }
    };
  });

  const totalCoverage = results.reduce((acc, r) => acc + r.coverage, 0) / results.length;

  const recommendations: string[] = [];
  results.forEach(r => {
    if (r.coverage < 0.8) {
      recommendations.push(`⚠️ ${r.name}: Only ${Math.round(r.coverage * 100)}% coverage`);
    }
    if (r.missingCount.es > 10) {
      recommendations.push(`🇪🇸 ${r.name}: ${r.missingCount.es} Spanish translations missing`);
    }
  });

  return {
    namespaces: results,
    overallCoverage: totalCoverage,
    recommendations
  };
}

// Console logger for quick debugging
export function logTranslationAudit(): void {
  const report = getTranslationAuditReport();
  
  console.group('🌍 Translation Audit Report');
  console.log(`Overall Coverage: ${Math.round(report.overallCoverage * 100)}%`);
  
  console.group('Namespaces:');
  report.namespaces.forEach(ns => {
    const icon = ns.coverage >= 0.9 ? '✅' : ns.coverage >= 0.7 ? '⚠️' : '❌';
    console.log(`${icon} ${ns.name}: ${Math.round(ns.coverage * 100)}% (ES: -${ns.missingCount.es}, DE: -${ns.missingCount.de}, FR: -${ns.missingCount.fr})`);
  });
  console.groupEnd();
  
  if (report.recommendations.length > 0) {
    console.group('Recommendations:');
    report.recommendations.forEach(r => console.log(r));
    console.groupEnd();
  }
  console.groupEnd();
}
