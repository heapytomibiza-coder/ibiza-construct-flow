import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GlassFeaturedCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  path: string;
  action: string;
  badge?: number;
  variant?: 'hero' | 'standard';
  delay?: number;
}

export function GlassFeaturedCard({
  icon: Icon,
  title,
  description,
  path,
  action,
  badge,
  variant = 'standard',
  delay = 0
}: GlassFeaturedCardProps) {
  const navigate = useNavigate();
  const isHero = variant === 'hero';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ 
        scale: 1.03,
        rotateY: isHero ? 0 : 1,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(path)}
      className={`
        group relative cursor-pointer overflow-hidden rounded-2xl
        ${isHero 
          ? 'md:col-span-2 lg:col-span-1 bg-gradient-to-br from-sage/20 via-sage/12 to-transparent backdrop-blur-xl border-2 border-sage/40 p-8' 
          : 'bg-gradient-to-br from-sage/10 via-sage/6 to-transparent backdrop-blur-lg border border-sage/25 p-6'
        }
        shadow-[0_8px_32px_0_rgba(0,0,0,0.08)]
        hover:shadow-[0_20px_60px_0_rgba(0,0,0,0.15)]
        hover:border-sage/50
        transition-all duration-300
        ${isHero ? 'min-h-[280px]' : 'min-h-[240px]'}
        flex flex-col justify-between
      `}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Animated gradient border on hover */}
      <motion.div
        className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        style={{
          background: 'linear-gradient(135deg, rgba(var(--sage), 0.3), rgba(var(--sage), 0.1), rgba(var(--sage), 0.3))',
          backgroundSize: '200% 200%',
        }}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Glass shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative z-10 flex-1">
        <div className="flex items-start justify-between mb-4">
          <motion.div 
            className={`
              rounded-xl bg-gradient-to-br from-sage/25 to-sage/15 
              backdrop-blur-sm border border-sage/30
              group-hover:border-sage/50 group-hover:from-sage/35 group-hover:to-sage/20
              group-hover:shadow-[0_0_20px_rgba(var(--sage),0.2)]
              transition-all duration-300
              ${isHero ? 'p-4' : 'p-3'}
            `}
            whileHover={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.3 }}
          >
            <Icon className={`${isHero ? 'h-10 w-10' : 'h-7 w-7'} text-sage-dark`} />
          </motion.div>
          
          {badge !== undefined && badge > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.2, type: "spring" }}
            >
              <Badge 
                variant="destructive" 
                className={`
                  ${isHero ? 'text-base px-3 py-1' : 'text-sm px-2 py-0.5'}
                  shadow-lg backdrop-blur-sm
                  animate-pulse
                `}
              >
                {badge} new
              </Badge>
            </motion.div>
          )}
        </div>
        
        <h3 className={`
          font-display font-bold text-foreground mb-2
          ${isHero ? 'text-3xl' : 'text-xl'}
        `}>
          {title}
        </h3>
        <p className={`
          text-muted-foreground
          ${isHero ? 'text-base line-clamp-3' : 'text-sm line-clamp-2'}
        `}>
          {description}
        </p>
      </div>
      
      <Button 
        className={`
          relative z-10 w-full mt-4
          ${isHero 
            ? 'bg-sage hover:bg-sage-dark text-white h-12 text-base shadow-lg' 
            : 'bg-sage/10 hover:bg-sage hover:text-white border-sage/30 h-10'
          }
          backdrop-blur-sm
          group-hover:shadow-[0_4px_20px_rgba(var(--sage),0.3)]
          transition-all duration-300
        `}
        variant={isHero ? "default" : "outline"}
        onClick={(e) => {
          e.stopPropagation();
          navigate(path);
        }}
      >
        {action}
      </Button>

      {/* Magnetic cursor effect indicator */}
      <motion.div
        className="absolute bottom-4 right-4 w-1 h-1 rounded-full bg-sage opacity-0 group-hover:opacity-100"
        animate={{
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
      />
    </motion.div>
  );
}
