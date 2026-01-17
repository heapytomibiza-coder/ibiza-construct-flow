/**
 * @ref-impl/user
 * User Module - Auth & Profile (role-agnostic)
 * 
 * Handles authentication, profile management, and settings
 * Shared across all roles (client, professional, admin)
 */

// Pages
export * from './pages';

// Services
export * from './services';

// DTOs
export * from './dto';

// Routes
export { UserRoutes } from './routes/UserRoutes';
