/**
 * Project Timeline Component
 * Phase 8: Client Dashboard Enhancement
 * 
 * Visual timeline of client projects with status tracking
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, CheckCircle, AlertCircle, PlayCircle, 
  Calendar, Euro, ChevronRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  title: string;
  category: string;
  status: 'draft' | 'posted' | 'matched' | 'in_progress' | 'completed' | 'disputed';
  budget?: string;
  startDate?: string;
  professionalName?: string;
  progress?: number;
}

export interface ProjectTimelineProps {
  projects?: Project[];
  onProjectClick?: (projectId: string) => void;
  className?: string;
}

const statusConfig = {
  draft: { 
    icon: AlertCircle, 
    color: 'text-amber-600', 
    bg: 'bg-amber-100 dark:bg-amber-950/30',
    label: 'Draft',
    badge: 'outline'
  },
  posted: { 
    icon: Clock, 
    color: 'text-blue-600', 
    bg: 'bg-blue-100 dark:bg-blue-950/30',
    label: 'Finding Pros',
    badge: 'secondary'
  },
  matched: { 
    icon: PlayCircle, 
    color: 'text-purple-600', 
    bg: 'bg-purple-100 dark:bg-purple-950/30',
    label: 'Matched',
    badge: 'secondary'
  },
  in_progress: { 
    icon: PlayCircle, 
    color: 'text-copper', 
    bg: 'bg-copper/10',
    label: 'In Progress',
    badge: 'default'
  },
  completed: { 
    icon: CheckCircle, 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-100 dark:bg-emerald-950/30',
    label: 'Completed',
    badge: 'default'
  },
  disputed: { 
    icon: AlertCircle, 
    color: 'text-rose-600', 
    bg: 'bg-rose-100 dark:bg-rose-950/30',
    label: 'Disputed',
    badge: 'destructive'
  }
};

export function ProjectTimeline({ 
  projects = [], 
  onProjectClick,
  className 
}: ProjectTimelineProps) {
  // Mock data if none provided
  const displayProjects = projects.length > 0 ? projects : [
    {
      id: '1',
      title: 'Kitchen Cabinet Installation',
      category: 'Carpentry',
      status: 'in_progress' as const,
      budget: '€2,400',
      startDate: '2024-01-15',
      professionalName: 'Ibiza Woodcraft Solutions',
      progress: 65
    },
    {
      id: '2',
      title: 'Electrical Panel Upgrade',
      category: 'Electrical',
      status: 'matched' as const,
      budget: '€1,800',
      startDate: '2024-01-20',
      professionalName: 'BrightWorks Ibiza'
    },
    {
      id: '3',
      title: 'Bathroom Renovation',
      category: 'Multiple',
      status: 'posted' as const,
      budget: '€3,500',
      startDate: '2024-01-22'
    }
  ];

  const groupedProjects = {
    active: displayProjects.filter(p => 
      ['in_progress', 'matched'].includes(p.status)
    ),
    pending: displayProjects.filter(p => 
      ['draft', 'posted'].includes(p.status)
    ),
    completed: displayProjects.filter(p => 
      p.status === 'completed'
    )
  };

  return (
    <Card className={cn('card-luxury', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-copper" />
            Project Timeline
          </CardTitle>
          <Badge variant="secondary">
            {displayProjects.length} Total
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Active Projects */}
        {groupedProjects.active.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-copper" />
              Active Projects
              <Badge variant="secondary" className="ml-auto">
                {groupedProjects.active.length}
              </Badge>
            </h3>
            
            {groupedProjects.active.map((project) => {
              const config = statusConfig[project.status];
              const StatusIcon = config.icon;
              
              return (
                <div 
                  key={project.id}
                  className="p-4 border border-sand-dark/20 rounded-lg hover:shadow-md transition-all cursor-pointer"
                  onClick={() => onProjectClick?.(project.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-charcoal">{project.title}</h4>
                        <Badge variant={config.badge as any} className="text-xs">
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{project.category}</p>
                    </div>
                    <div className={cn('p-2 rounded-lg', config.bg)}>
                      <StatusIcon className={cn('w-4 h-4', config.color)} />
                    </div>
                  </div>
                  
                  {project.progress !== undefined && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <div className="h-2 bg-sand-light rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-copper to-amber-600 rounded-full transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      {project.professionalName && (
                        <span className="text-muted-foreground">
                          {project.professionalName}
                        </span>
                      )}
                      {project.budget && (
                        <div className="flex items-center gap-1 text-copper font-medium">
                          <Euro className="w-3 h-3" />
                          {project.budget}
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      View <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pending Projects */}
        {groupedProjects.pending.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Pending
              <Badge variant="outline" className="ml-auto">
                {groupedProjects.pending.length}
              </Badge>
            </h3>
            
            {groupedProjects.pending.map((project) => {
              const config = statusConfig[project.status];
              const StatusIcon = config.icon;
              
              return (
                <div 
                  key={project.id}
                  className="p-3 border border-sand-dark/10 rounded-lg hover:border-sand-dark/30 transition-all cursor-pointer"
                  onClick={() => onProjectClick?.(project.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn('p-2 rounded-lg', config.bg)}>
                        <StatusIcon className={cn('w-4 h-4', config.color)} />
                      </div>
                      <div>
                        <h4 className="font-medium text-charcoal text-sm">{project.title}</h4>
                        <p className="text-xs text-muted-foreground">{project.category}</p>
                      </div>
                    </div>
                    <Badge variant={config.badge as any} className="text-xs">
                      {config.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {displayProjects.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-charcoal mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground mb-4">Start by posting your first job</p>
            <Button className="bg-gradient-hero hover:bg-copper">
              Post a Job
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
