import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Package, 
  BarChart3, 
  MessageSquare, 
  FileText, 
  DollarSign, 
  Calendar,
  Settings,
  Bell,
  MapPin,
  Award,
  Camera,
  ChevronDown,
  Users,
  Zap,
  Star,
  Shield,
  HelpCircle,
  MessageCircle,
  FileCheck,
  CreditCard,
  Image
} from 'lucide-react';
import { HeroStatsBar } from './features/HeroStatsBar';
import { GlassFeaturedCard } from './features/GlassFeaturedCard';
import { GlassCompactCard } from './features/GlassCompactCard';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export function ProfessionalFeaturesShowcase() {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const unreadMessages = 3; // This should come from actual data
  const unreadJobs = 24; // This should come from actual data

  return (
    <div className="space-y-4 sm:space-y-6 relative px-4 sm:px-0">
      {/* Background gradient layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-sage/5 via-transparent to-sage/5 pointer-events-none -z-10" />

      {/* Hero Stats Bar - Asymmetric Layout */}
      <HeroStatsBar />

      {/* Featured Actions - Bento Grid with Priority Cards */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-3 sm:space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-sage-dark" />
              <h2 className="text-base sm:text-lg md:text-xl font-display font-bold text-foreground">Quick Actions</h2>
            </div>
            {unreadJobs > 0 && (
              <span className="text-xs sm:text-sm text-muted-foreground">
                {unreadJobs} new {unreadJobs === 1 ? 'opportunity' : 'opportunities'}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <GlassFeaturedCard
              icon={Briefcase}
              title="Browse Jobs"
              description="Find new opportunities matching your skills and expertise. Get notified when jobs match your profile."
              path="/job-board"
              action="View All Jobs"
              badge={unreadJobs}
              variant="hero"
              delay={0}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <GlassFeaturedCard
                icon={Package}
                title="My Services"
                description="Manage your service offerings, set pricing, and update availability"
                path="/professional/services"
                action="Manage Services"
                variant="standard"
                delay={0.1}
              />
              <GlassFeaturedCard
                icon={Image}
                title="Portfolio"
                description="Showcase your best work to attract more clients"
                path="/professional/portfolio"
                action="Edit Portfolio"
                variant="standard"
                delay={0.2}
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Business Tools */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-3 sm:space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-sage-dark" />
              <h2 className="text-base sm:text-lg md:text-xl font-display font-bold text-foreground">Business Tools</h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
              Everything you need to run your business
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <GlassCompactCard
              icon={BarChart3}
              title="Analytics"
              description="Track your performance metrics and growth trends"
              path="/dashboard/pro/analytics"
              action="View Analytics"
              delay={0}
            />
            <GlassCompactCard
              icon={MessageSquare}
              title="Messages"
              description="Chat with clients and respond to inquiries"
              path="/messages"
              action="Open Inbox"
              badge={unreadMessages}
              delay={0.1}
            />
            <GlassCompactCard
              icon={FileText}
              title="Contracts"
              description="Manage agreements and project terms"
              path="/contracts"
              action="View Contracts"
              delay={0.2}
            />
            <GlassCompactCard
              icon={DollarSign}
              title="Payments"
              description="Track earnings and payment history"
              path="/payments"
              action="View Payments"
              delay={0.3}
            />
          </div>
        </motion.div>
      </section>

      {/* Client Management */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="space-y-3 sm:space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-sage-dark" />
              <h2 className="text-base sm:text-lg md:text-xl font-display font-bold text-foreground">Client Management</h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
              Build strong client relationships
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <GlassCompactCard
              icon={MessageCircle}
              title="Communications"
              description="View all client messages and conversation history"
              path="/messages"
              action="View All"
              badge={unreadMessages}
              delay={0}
            />
            <GlassCompactCard
              icon={FileCheck}
              title="Active Contracts"
              description="Manage your ongoing client projects"
              path="/contracts?status=active"
              action="View Active"
              delay={0.1}
            />
            <GlassCompactCard
              icon={CreditCard}
              title="Payment History"
              description="Review all completed transactions"
              path="/payments?view=history"
              action="View History"
              delay={0.2}
            />
            <GlassCompactCard
              icon={Calendar}
              title="Availability"
              description="Set your working hours and time off"
              path="/availability"
              action="Set Availability"
              delay={0.3}
            />
          </div>
        </motion.div>
      </section>

      {/* Settings & Tools - Collapsible */}
      <section>
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-sage/5 rounded-lg sm:rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-sage-dark" />
                <span className="text-sm sm:text-base md:text-lg font-display font-bold text-foreground">Settings & Tools</span>
                <span className="text-xs text-muted-foreground hidden md:inline">• Customize your experience</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <GlassCompactCard
                icon={Bell}
                title="Notifications"
                description="Manage your alert preferences and stay updated"
                path="/settings/notifications"
                action="Configure"
                delay={0}
              />
              <GlassCompactCard
                icon={Shield}
                title="Privacy"
                description="Control your data and security settings"
                path="/settings/privacy"
                action="Manage Privacy"
                delay={0.1}
              />
              <GlassCompactCard
                icon={HelpCircle}
                title="Help Center"
                description="Get support and find answers to common questions"
                path="/help"
                action="Get Help"
                delay={0.2}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </section>

      {/* CTA Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-sage/15 via-sage/8 to-transparent backdrop-blur-xl border border-sage/30 p-6 sm:p-8 md:p-10"
      >
        <div className="relative z-10 text-center space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage/10 border border-sage/20 text-xs sm:text-sm text-sage-dark font-medium mb-2">
            <Star className="h-3 w-3 sm:h-4 sm:w-4" />
            Boost Your Profile
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-foreground">
            Ready to Grow Your Business?
          </h3>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Complete your profile and start getting more client inquiries. Professionals with complete profiles get 3x more opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
            <Button
              onClick={() => navigate('/professional/profile/edit')}
              className="bg-sage hover:bg-sage-dark text-white h-10 sm:h-11 md:h-12 px-6 sm:px-8 text-sm sm:text-base shadow-lg hover:shadow-xl transition-shadow"
            >
              Complete Profile
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/help')}
              className="border-sage/30 hover:bg-sage/5 h-10 sm:h-11 md:h-12 px-6 sm:px-8 text-sm sm:text-base"
            >
              Learn More
            </Button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-sage/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-sage/10 rounded-full blur-3xl" />
      </motion.div>
    </div>
  );
}
