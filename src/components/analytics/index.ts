// Analytics Components Barrel Export
// Phase 5: Analytics & Chart Components Consolidation

export { MetricCard } from './MetricCard';
export { AnalyticsChart } from './AnalyticsChart';
export { RevenueChart } from './RevenueChart';
export { PaymentMethodChart } from './PaymentMethodChart';

// Legacy exports for backwards compatibility
// TODO: Update imports across codebase to use MetricCard directly
export { MetricCard as AnalyticsMetricCard } from './MetricCard';
