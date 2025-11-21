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
  ChevronDown
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

  return (
    <div className="space-y-6 relative">
      {/* Background gradient layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-sage/5 via-transparent to-sage/5 pointer-events-none -z-10" />

      {/* Hero Stats Bar - Asymmetric Layout */}
      <HeroStatsBar />

      {/* Featured Actions - Bento Grid with Priority Cards */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">⚡</span>
          <h3 className="text-lg font-bold">Quick Actions</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Hero Card - Browse Jobs (Most Important) */}
          <GlassFeaturedCard
            icon={Briefcase}
            title="Browse Jobs"
            description="Find new opportunities matching your skills and expertise"
            path="/job-board"
            action="View All Jobs"
            badge={24}
            variant="hero"
            delay={0}
          />
          
          {/* Standard Featured Cards */}
          <GlassFeaturedCard
            icon={Package}
            title="My Services"
            description="Manage your service offerings and pricing"
            path="/professional/services"
            action="Manage Services"
            variant="standard"
            delay={0.1}
          />
          <GlassFeaturedCard
            icon={Camera}
            title="Portfolio"
            description="Showcase your best work and projects"
            path="/professional/portfolio"
            action="Edit Portfolio"
            variant="standard"
            delay={0.2}
          />
        </div>
      </div>

      {/* Business Tools - Compact Hover-Reveal Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">💼</span>
          <h3 className="text-lg font-bold">Business Tools</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <GlassCompactCard
            icon={BarChart3}
            title="Analytics"
            description="Track your performance metrics and growth"
            path="/dashboard/pro/analytics"
            action="View Analytics"
            delay={0}
          />
          <GlassCompactCard
            icon={MessageSquare}
            title="Messages"
            description="Client communications and inquiries"
            path="/messages"
            action="Open Inbox"
            badge={unreadMessages}
            delay={0.05}
          />
          <GlassCompactCard
            icon={FileText}
            title="Contracts"
            description="Manage agreements and proposals"
            path="/contracts"
            action="View Contracts"
            delay={0.1}
          />
          <GlassCompactCard
            icon={DollarSign}
            title="Payments"
            description="Financial overview and invoices"
            path="/payments"
            action="View Payments"
            delay={0.15}
          />
        </div>
      </div>

      {/* Client Management - Bento Grid Layout */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🤝</span>
          <h3 className="text-lg font-bold">Client Management</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Communications - Prominent if has messages */}
          <div className={unreadMessages > 0 ? 'sm:col-span-2' : ''}>
            <GlassCompactCard
              icon={MessageSquare}
              title="Communications"
              description="Message history and client inquiries"
              path="/messages"
              action="View Messages"
              badge={unreadMessages}
              delay={0}
            />
          </div>
          
          <GlassCompactCard
            icon={FileText}
            title="Active Contracts"
            description="Current agreements and proposals"
            path="/contracts"
            action="View Contracts"
            delay={0.05}
          />
          <GlassCompactCard
            icon={DollarSign}
            title="Payment History"
            description="Transaction records and invoices"
            path="/payments"
            action="View History"
            delay={0.1}
          />
          <div className="sm:col-span-2 lg:col-span-4">
            <GlassCompactCard
              icon={Calendar}
              title="Availability"
              description="Manage your schedule and booking windows"
              path="/availability"
              action="Set Availability"
              delay={0.15}
            />
          </div>
        </div>
      </div>

      {/* Settings & Tools - Collapsible Glass Card */}
      <Collapsible open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <motion.div
          initial={false}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sage/8 via-sage/4 to-transparent backdrop-blur-lg border border-sage/20"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full flex items-center justify-between p-4 hover:bg-sage/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-sage-dark" />
                <span className="font-semibold text-sm">Settings & Tools</span>
              </div>
              <motion.div
                animate={{ rotate: isSettingsOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2"
            >
              <GlassCompactCard
                icon={Settings}
                title="Profile Settings"
                description="Update your professional information"
                path="/settings/profile"
                action="Edit Profile"
                delay={0}
              />
              <GlassCompactCard
                icon={Bell}
                title="Notifications"
                description="Manage alerts and preferences"
                path="/settings/notifications"
                action="Configure"
                delay={0.05}
              />
              <GlassCompactCard
                icon={MapPin}
                title="Service Areas"
                description="Define coverage zones"
                path="/professional/service-areas"
                action="Edit Areas"
                delay={0.1}
              />
              <GlassCompactCard
                icon={Award}
                title="Certifications"
                description="Licenses and credentials"
                path="/professional/verification"
                action="Manage Certs"
                delay={0.15}
              />
            </motion.div>
          </CollapsibleContent>
        </motion.div>
      </Collapsible>

      {/* CTA Card - Floating Glass Effect */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sage/15 via-sage/8 to-transparent backdrop-blur-xl border border-sage/30 p-8 shadow-[0_20px_60px_0_rgba(0,0,0,0.1)]"
      >
        {/* Animated background glow */}
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-sage/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <div className="relative z-10 text-center space-y-4">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-2xl font-display font-bold text-foreground"
          >
            Ready to Grow Your Business?
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-sm text-muted-foreground max-w-md mx-auto"
          >
            Complete your profile and start getting more client inquiries
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, type: "spring" }}
          >
            <Button
              size="lg"
              className="bg-sage hover:bg-sage-dark text-white shadow-[0_8px_24px_rgba(var(--sage),0.3)] hover:shadow-[0_12px_32px_rgba(var(--sage),0.4)] transition-all duration-300"
              onClick={() => navigate('/settings/profile')}
            >
              Complete Profile
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
