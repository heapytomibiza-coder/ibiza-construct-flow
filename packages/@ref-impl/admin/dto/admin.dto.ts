/**
 * Admin DTOs
 * @ref-impl/admin - Admin-specific data transfer objects
 */

/**
 * Admin user view
 */
export interface AdminUserView {
  id: string;
  email: string;
  fullName: string;
  role: 'client' | 'professional' | 'admin';
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
  lastLoginAt?: string;
  jobCount?: number;
  totalEarnings?: number;
}

/**
 * Moderation action
 */
export interface ModerationAction {
  id: string;
  targetType: 'user' | 'job' | 'review';
  targetId: string;
  action: 'approve' | 'reject' | 'suspend' | 'delete';
  reason?: string;
  adminId: string;
  createdAt: string;
}

/**
 * Platform analytics
 */
export interface PlatformAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalJobs: number;
  completedJobs: number;
  totalRevenue: number;
  averageJobValue: number;
  period: string;
}
