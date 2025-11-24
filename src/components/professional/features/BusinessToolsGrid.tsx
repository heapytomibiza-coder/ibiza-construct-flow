import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BarChart3, 
  Package, 
  Camera, 
  MessageSquare, 
  FileText, 
  DollarSign,
  Calendar,
  Settings,
  Bell
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useConversationList } from '@/hooks/useConversationList';

interface ToolCard {
  icon: any;
  title: string;
  description: string;
  path: string;
  badge?: number;
}

export function BusinessToolsGrid() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { totalUnread } = useConversationList(user?.id);

  const tools: ToolCard[] = [
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Track performance and growth',
      path: '/dashboard/pro/analytics'
    },
    {
      icon: Package,
      title: 'My Services',
      description: 'Manage offerings and pricing',
      path: '/professional/services'
    },
    {
      icon: Camera,
      title: 'Portfolio',
      description: 'Showcase your best work',
      path: '/professional/portfolio'
    },
    {
      icon: MessageSquare,
      title: 'Messages',
      description: 'Chat with clients',
      path: '/messages',
      badge: totalUnread || undefined
    },
    {
      icon: FileText,
      title: 'Contracts',
      description: 'Manage agreements',
      path: '/contracts'
    },
    {
      icon: DollarSign,
      title: 'Payments',
      description: 'Track earnings',
      path: '/payments'
    },
    {
      icon: Calendar,
      title: 'Availability',
      description: 'Set working hours',
      path: '/availability'
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Manage alerts',
      path: '/settings/notifications'
    },
    {
      icon: Settings,
      title: 'Settings',
      description: 'Account preferences',
      path: '/settings'
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Business Tools</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {tools.map((tool, index) => (
          <Card 
            key={index}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(tool.path)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-copper/10 rounded-lg flex items-center justify-center">
                  <tool.icon className="w-5 h-5 text-copper" />
                </div>
                {tool.badge && (
                  <span className="bg-copper text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    {tool.badge}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-foreground mb-1">{tool.title}</h3>
              <p className="text-xs text-muted-foreground">{tool.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
