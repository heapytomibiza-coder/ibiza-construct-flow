import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Settings, 
  Database,
  Search,
  Filter
} from 'lucide-react';
import DatabaseStats from './DatabaseStats';
import FeatureFlagsManager from './FeatureFlagsManager';
import UserInspector from './UserInspector';
import { AdminDocumentReview } from './AdminDocumentReview';

export default function AdminDashboardTabs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      description: 'Platform statistics and key metrics'
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      description: 'Manage users and inspect profiles'
    },
    {
      id: 'documents',
      label: 'Document Review',
      icon: FileText,
      description: 'Review and verify professional documents'
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: Settings,
      description: 'Feature flags and platform configuration'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Platform Administration</h2>
          <p className="text-muted-foreground">Manage your platform efficiently with organised tools</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search admin functions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Tabs Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex-col gap-2 h-16 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab Content Areas */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <CardTitle>Platform Statistics</CardTitle>
              </div>
              <CardDescription>
                Real-time overview of your platform's key metrics and database health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DatabaseStats />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle>User Management</CardTitle>
              </div>
              <CardDescription>
                Search, inspect, and manage user profiles and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserInspector />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>Document Review Centre</CardTitle>
              </div>
              <CardDescription>
                Review and verify professional documents and certifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminDocumentReview />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <CardTitle>System Configuration</CardTitle>
              </div>
              <CardDescription>
                Manage feature flags and platform-wide settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FeatureFlagsManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}