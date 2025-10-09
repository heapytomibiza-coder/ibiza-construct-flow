import { Home, Search, MessageSquare, User, Briefcase } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useRole } from '@/lib/roleHelpers';

export const MobileNav = () => {
  const location = useLocation();
  const { active, isProfessional } = useRole();

  const navItems = [
    { icon: Briefcase, label: 'Jobs', path: '/job-board' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: User, label: 'Profile', path: isProfessional ? '/professional/profile' : '/client/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t lg:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
