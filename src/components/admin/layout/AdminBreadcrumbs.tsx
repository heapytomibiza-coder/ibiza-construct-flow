import { useLocation, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function AdminBreadcrumbs() {
  const location = useLocation();
  const { t } = useTranslation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Label mapping for common routes
  const labelMap: Record<string, string> = {
    'admin': t('navigation.dashboard'),
    'jobs': 'Jobs',
    'users': 'Users',
    'profiles': 'Profiles',
    'disputes': 'Disputes',
    'analytics': 'Analytics',
    'settings': t('navigation.settings'),
    'questions': 'Questions',
    'website-settings': 'Website Settings',
    'verifications': 'Verifications',
    'contracts': 'Contracts',
    'bookings': 'Bookings',
  };

  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    
    return { path, label };
  });

  return (
    <nav className="flex items-center gap-2 text-sm">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center gap-2">
          {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          {index === breadcrumbs.length - 1 ? (
            <span className="text-foreground font-medium">{crumb.label}</span>
          ) : (
            <Link
              to={crumb.path}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
