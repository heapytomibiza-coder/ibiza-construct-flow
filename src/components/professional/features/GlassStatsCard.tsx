import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface GlassStatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  variant?: 'primary' | 'secondary';
  delay?: number;
}

export function GlassStatsCard({
  icon: Icon,
  label,
  value,
  variant = 'secondary',
  delay = 0
}: GlassStatsCardProps) {
  const isPrimary = variant === 'primary';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ 
        scale: 1.02,
        rotateX: 2,
        rotateY: isPrimary ? 0 : 2,
        transition: { duration: 0.15 }
      }}
      whileTap={{ scale: 0.98 }}
      className={`
        group relative overflow-hidden rounded-xl sm:rounded-2xl
        ${isPrimary 
          ? 'bg-gradient-to-br from-sage/15 via-sage/10 to-transparent backdrop-blur-xl border border-sage/30 p-4 sm:p-6 md:p-8' 
          : 'bg-gradient-to-br from-sage/8 via-sage/5 to-transparent backdrop-blur-lg border border-sage/20 p-3 sm:p-4 md:p-6'
        }
        shadow-[0_8px_32px_0_rgba(0,0,0,0.08)]
        active:shadow-[0_12px_48px_0_rgba(0,0,0,0.12)]
        active:border-sage/40
        transition-all duration-300
      `}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Glass shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative z-10">
        <div className={`flex items-start ${isPrimary ? 'flex-col sm:flex-row sm:justify-between' : 'gap-2 sm:gap-3 md:gap-4'}`}>
          <div className={`
            rounded-lg sm:rounded-xl bg-gradient-to-br from-sage/20 to-sage/10 
            p-2 sm:p-3 backdrop-blur-sm border border-sage/20
            group-active:border-sage/40 group-active:from-sage/30 group-active:to-sage/15
            transition-all duration-300
            ${isPrimary ? 'sm:p-3 md:p-4' : ''}
          `}>
            <Icon className={`${isPrimary ? 'h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8' : 'h-5 w-5 sm:h-6 sm:w-6'} text-sage-dark`} />
          </div>
          
          <div className={`flex-1 ${isPrimary ? 'mt-3 sm:mt-0 sm:text-right' : 'text-left'}`}>
            <p className={`
              text-muted-foreground font-medium tracking-wide uppercase
              ${isPrimary ? 'text-[10px] sm:text-xs md:text-sm mb-1 sm:mb-2' : 'text-[10px] sm:text-xs mb-0.5 sm:mb-1'}
            `}>
              {label}
            </p>
            <p className={`
              font-display font-bold text-foreground
              ${isPrimary ? 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl' : 'text-xl sm:text-2xl md:text-3xl'}
            `}>
              {value}
            </p>
          </div>
        </div>
        
        {/* Animated pulse for primary */}
        {isPrimary && (
          <motion.div
            className="absolute top-2 right-2 w-2 h-2 rounded-full bg-sage"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </div>
    </motion.div>
  );
}
