/**
 * Performance Budgets
 * Phase 15: Performance Monitoring & Optimization
 * 
 * Define and enforce performance budgets
 */

export interface PerformanceBudget {
  metric: string;
  budget: number;
  unit: 'ms' | 'score' | 'kb' | 'requests';
  warning: number; // Percentage of budget (e.g., 80 = warn at 80% of budget)
}

/**
 * Performance budgets for the application
 */
export const PERFORMANCE_BUDGETS: PerformanceBudget[] = [
  // Core Web Vitals
  { metric: 'LCP', budget: 2500, unit: 'ms', warning: 80 },
  { metric: 'FID', budget: 100, unit: 'ms', warning: 80 },
  { metric: 'CLS', budget: 0.1, unit: 'score', warning: 80 },
  { metric: 'FCP', budget: 1800, unit: 'ms', warning: 80 },
  { metric: 'TTFB', budget: 800, unit: 'ms', warning: 80 },
  { metric: 'INP', budget: 200, unit: 'ms', warning: 80 },
  
  // Bundle sizes
  { metric: 'Initial JS Bundle', budget: 200, unit: 'kb', warning: 90 },
  { metric: 'Initial CSS Bundle', budget: 50, unit: 'kb', warning: 90 },
  { metric: 'Total Page Size', budget: 1000, unit: 'kb', warning: 85 },
  
  // Request counts
  { metric: 'HTTP Requests', budget: 50, unit: 'requests', warning: 80 },
  { metric: 'Third-party Requests', budget: 10, unit: 'requests', warning: 80 },
  
  // Custom metrics
  { metric: 'Route Change Time', budget: 200, unit: 'ms', warning: 80 },
  { metric: 'API Response Time', budget: 300, unit: 'ms', warning: 80 },
];

/**
 * Check if metric exceeds budget
 */
export function checkBudget(
  metric: string,
  value: number
): { exceeded: boolean; warning: boolean; percentage: number } {
  const budget = PERFORMANCE_BUDGETS.find(b => b.metric === metric);
  
  if (!budget) {
    return { exceeded: false, warning: false, percentage: 0 };
  }
  
  const percentage = (value / budget.budget) * 100;
  const warningThreshold = (budget.warning / 100) * budget.budget;
  
  return {
    exceeded: value > budget.budget,
    warning: value > warningThreshold && value <= budget.budget,
    percentage,
  };
}

/**
 * Get all budget violations
 */
export function getBudgetViolations(metrics: Record<string, number>) {
  const violations: Array<{
    metric: string;
    value: number;
    budget: number;
    percentage: number;
    severity: 'warning' | 'error';
  }> = [];
  
  Object.entries(metrics).forEach(([metric, value]) => {
    const result = checkBudget(metric, value);
    
    if (result.exceeded || result.warning) {
      const budget = PERFORMANCE_BUDGETS.find(b => b.metric === metric);
      
      violations.push({
        metric,
        value,
        budget: budget?.budget || 0,
        percentage: result.percentage,
        severity: result.exceeded ? 'error' : 'warning',
      });
    }
  });
  
  return violations;
}

/**
 * Format budget report
 */
export function formatBudgetReport(metrics: Record<string, number>): string {
  const violations = getBudgetViolations(metrics);
  
  if (violations.length === 0) {
    return '✅ All performance budgets met!';
  }
  
  const lines = ['⚠️ Performance Budget Violations:', ''];
  
  violations.forEach(v => {
    const icon = v.severity === 'error' ? '❌' : '⚠️';
    lines.push(
      `${icon} ${v.metric}: ${v.value} (${v.percentage.toFixed(0)}% of budget: ${v.budget})`
    );
  });
  
  return lines.join('\n');
}
