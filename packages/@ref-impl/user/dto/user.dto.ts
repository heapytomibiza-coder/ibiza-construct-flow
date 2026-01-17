/**
 * User DTOs
 * @ref-impl/user - User-specific data transfer objects
 */

/**
 * User session information
 */
export interface UserSession {
  id: string;
  email: string;
  role: 'client' | 'professional' | 'admin';
  isAuthenticated: boolean;
  accessToken?: string;
}

/**
 * Sign in request
 */
export interface SignInRequest {
  email: string;
  password: string;
}

/**
 * Sign up request
 */
export interface SignUpRequest {
  email: string;
  password: string;
  fullName: string;
  role: 'client' | 'professional';
}

/**
 * User profile
 */
export interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: 'client' | 'professional' | 'admin';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Profile update request
 */
export interface ProfileUpdateRequest {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
}
