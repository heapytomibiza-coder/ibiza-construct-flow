// Admin Components Barrel Export
// Phase 9: Admin & Dashboard Components Organization

// Core Dashboard
export { AdminDashboard } from './AdminDashboard';
export { default as AdminDashboardTabs } from './AdminDashboardTabs';
export { OverviewDashboard } from './OverviewDashboard';
export { IntelligenceDashboard } from './IntelligenceDashboard';

// Guards & Access Control
export { AdminGuard } from './AdminGuard';
export { ImpersonationBanner } from './ImpersonationBanner';
export { ImpersonationControls } from './ImpersonationControls';

// User & Profile Management
export { AdminUserManagement } from './AdminUserManagement';
export { default as UserInspector } from './UserInspector';
export { default as ProfileModerationQueue } from './ProfileModerationQueue';

// Verification & Approval
export { VerificationQueue } from './VerificationQueue';
export { VerificationDetailModal } from './VerificationDetailModal';
export { DualApprovalModal } from './DualApprovalModal';
export { AdminDocumentReview } from './AdminDocumentReview';

// Content Moderation
export { ContentModerationPanel } from './ContentModerationPanel';
// ReviewModerationPanel removed - new review system

// Jobs & Services Management
export { JobEditModal } from './JobEditModal';
export { default as ServiceMicroManager } from './ServiceMicroManager';

// Analytics & Reporting
export { DiscoveryAnalyticsDashboard } from './DiscoveryAnalyticsDashboard';
export { PerformanceDashboard } from './PerformanceDashboard';
export { UserAnalyticsDashboard } from './UserAnalyticsDashboard';
export { ReportExportCenter } from './ReportExportCenter';

// System Health & Performance
export { SystemHealthDashboard } from './SystemHealthDashboard';
export { SystemHealthMonitor } from './SystemHealthMonitor';
export { PerformanceMonitor } from './PerformanceMonitor';
export { default as DatabaseStats } from './DatabaseStats';

// Configuration & Settings
export { SecuritySettings } from './SecuritySettings';
export { default as FeatureFlagsManager } from './FeatureFlagsManager';
export { IntegrationHub } from './IntegrationHub';

// Audit & Compliance
export { AdminAuditLog } from './AdminAuditLog';
export { AuditLogViewer } from './AuditLogViewer';

// Financial & Payouts
export { PayoutBatchScheduler } from './PayoutBatchScheduler';

// AI & Automation
export { default as AIPanel } from './AIPanel';
export { default as AIResultModal } from './AIResultModal';
export { default as ProfessionalMatchModal } from './ProfessionalMatchModal';
export { default as CommunicationsDrafterModal } from './CommunicationsDrafterModal';

// Validation & Risk Assessment
export { default as PriceValidationBadge } from './PriceValidationBadge';
export { BookingRiskBadge } from './BookingRiskBadge';

// Bulk Operations
export { BulkActionSheet } from './BulkActionSheet';

// Utilities & Tools
export { DiffViewer } from './DiffViewer';
export { WorkspaceSearch } from './WorkspaceSearch';
export { TestRunner } from './TestRunner';
export { AdminSeedTestButtons } from './AdminSeedTestButtons';
