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
      className={`
        group relative overflow-hidden rounded-2xl
        ${isPrimary 
          ? 'bg-gradient-to-br from-sage/15 via-sage/10 to-transparent backdrop-blur-xl border border-sage/30 p-8' 
          : 'bg-gradient-to-br from-sage/8 via-sage/5 to-transparent backdrop-blur-lg border border-sage/20 p-6'
        }
        shadow-[0_8px_32px_0_rgba(0,0,0,0.08)]
        hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.12)]
        hover:border-sage/40
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
        <div className={`flex items-start ${isPrimary ? 'justify-between' : 'gap-4'}`}>
          <div className={`
            rounded-xl bg-gradient-to-br from-sage/20 to-sage/10 
            p-3 backdrop-blur-sm border border-sage/20
            group-hover:border-sage/40 group-hover:from-sage/30 group-hover:to-sage/15
            transition-all duration-300
            ${isPrimary ? 'p-4' : ''}
          `}>
            <Icon className={`${isPrimary ? 'h-8 w-8' : 'h-6 w-6'} text-sage-dark`} />
          </div>
          
          <div className={`flex-1 ${isPrimary ? 'text-right' : 'text-left'}`}>
            <p className={`
              text-muted-foreground font-medium tracking-wide uppercase
              ${isPrimary ? 'text-sm mb-2' : 'text-xs mb-1'}
            `}>
              {label}
            </p>
            <p className={`
              font-display font-bold text-foreground
              ${isPrimary ? 'text-5xl' : 'text-3xl'}
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
