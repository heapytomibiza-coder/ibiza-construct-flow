/**
 * Enhanced Wizard Header with Navigation Helpers
 * - Breadcrumbs for context
 * - Clickable step tabs/pills
 * - Quick links dropdown
 * - Progress bar with labels
 */
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  Home, 
  LayoutDashboard, 
  Briefcase, 
  User, 
  Settings, 
  HelpCircle,
  ChevronDown,
  Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface WizardHeaderProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  onStepClick?: (step: number) => void;
  canNavigateToStep?: (step: number) => boolean;
  wizardState?: {
    mainCategory?: string;
    subcategory?: string;
    microNames?: string[];
  };
}

export const WizardHeader: React.FC<WizardHeaderProps> = ({
  currentStep,
  totalSteps,
  stepLabels,
  onStepClick,
  canNavigateToStep,
  wizardState
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation(['wizard', 'navigation', 'common']);

  // Translated step labels
  const translatedStepLabels = [
    t('wizard:navigation.progressLabels.category'),
    t('wizard:steps.subcategory.specializedWork'),
    t('wizard:steps.microservice.title', { defaultValue: 'Micro Service' }).split('?')[0].trim(),
    t('wizard:navigation.progressLabels.aiQuestions'),
    t('wizard:steps.logistics.title'),
    t('wizard:steps.extras.title'),
    t('wizard:navigation.progressLabels.review')
  ];

  // Build dynamic breadcrumbs based on wizard state
  const buildBreadcrumbs = (): Array<{ label: string; href?: string }> => {
    const crumbs: Array<{ label: string; href?: string }> = [
      { label: t('navigation:home'), href: '/' },
      { label: t('navigation:postProject'), href: '/post' }
    ];

    if (wizardState?.mainCategory && currentStep > 1) {
      crumbs.push({ label: wizardState.mainCategory });
    }
    
    if (wizardState?.subcategory && currentStep > 2) {
      crumbs.push({ label: wizardState.subcategory });
    }

    if (wizardState?.microNames && wizardState.microNames.length > 0 && currentStep > 3) {
      const microLabel = wizardState.microNames.length > 1 
        ? `${wizardState.microNames.length} ${t('common:services')}`
        : wizardState.microNames[0];
      crumbs.push({ label: microLabel });
    }

    return crumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  const quickLinks = [
    { label: t('navigation:dashboard'), href: '/dashboard/client', icon: LayoutDashboard },
    { label: t('navigation:jobs'), href: '/job-board', icon: Briefcase },
    { label: t('navigation:profile'), href: '/profile', icon: User },
    { label: t('navigation:settings'), href: '/settings', icon: Settings },
  ];

  const handleStepClick = (step: number) => {
    if (onStepClick && canNavigateToStep?.(step)) {
      onStepClick(step);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-sage-muted/40 z-40 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        {/* Top row: Breadcrumbs + Quick Links */}
        <div className="flex items-center justify-between mb-3">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm overflow-x-auto">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                {crumb.href ? (
                  <Link 
                    to={crumb.href} 
                    className="text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
                  >
                    {index === 0 && <Home className="w-3.5 h-3.5 inline mr-1" />}
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium whitespace-nowrap">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Quick Links Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 text-sm">
                <span className="hidden sm:inline">{t('common:quickLinks', { defaultValue: 'Quick Links' })}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white z-50">
              {quickLinks.map((link) => (
                <DropdownMenuItem key={link.href} onClick={() => navigate(link.href)}>
                  <link.icon className="w-4 h-4 mr-2" />
                  {link.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.open('/help', '_blank')}>
                <HelpCircle className="w-4 h-4 mr-2" />
                {t('common:help', { defaultValue: 'Help' })}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title and Step Badge */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-sage-deep">
            {t('navigation:postProject')}
          </h2>
          <Badge variant="outline" className="text-xs">
            {t('wizard:navigation.stepCounter', {
              current: currentStep,
              total: totalSteps,
              description: translatedStepLabels[currentStep - 1]
            }).replace(/Step.*:/, `Step ${currentStep} of ${totalSteps}:`)}
          </Badge>
        </div>

        {/* Clickable Step Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {translatedStepLabels.map((label, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const isFuture = stepNumber > currentStep;
            const canNavigate = canNavigateToStep?.(stepNumber) ?? isCompleted;

            return (
              <button
                key={index}
                onClick={() => handleStepClick(stepNumber)}
                disabled={!canNavigate && !isCurrent}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                  isCompleted && "bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer",
                  isCurrent && "bg-primary text-primary-foreground shadow-sm",
                  isFuture && "bg-muted text-muted-foreground cursor-not-allowed opacity-60",
                  canNavigate && !isCurrent && "hover:scale-105"
                )}
              >
                {isCompleted ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <span className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold",
                    isCurrent ? "bg-primary-foreground/20" : "bg-current/10"
                  )}>
                    {stepNumber}
                  </span>
                )}
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
            <span>{t('common:start', { defaultValue: 'Start' })}</span>
            <span>{Math.round(((currentStep - 1) / (totalSteps - 1)) * 100)}% {t('common:complete', { defaultValue: 'complete' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
