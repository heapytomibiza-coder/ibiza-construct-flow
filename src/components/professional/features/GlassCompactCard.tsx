import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface GlassCompactCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  path: string;
  action: string;
  badge?: number;
  delay?: number;
}

export function GlassCompactCard({
  icon: Icon,
  title,
  description,
  path,
  action,
  badge,
  delay = 0
}: GlassCompactCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ 
        scale: 1.02,
        y: -4,
        transition: { duration: 0.15 }
      }}
      onClick={() => navigate(path)}
      className={`
        group relative cursor-pointer overflow-hidden rounded-xl
        bg-gradient-to-br from-sage/6 via-sage/3 to-transparent 
        backdrop-blur-md border border-sage/15
        hover:border-sage/30 hover:from-sage/10 hover:via-sage/6
        shadow-[0_4px_16px_0_rgba(0,0,0,0.04)]
        hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.08)]
        transition-all duration-300
        ${isHovered ? 'h-32' : 'h-20'}
      `}
    >
      {/* Glass shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative z-10 p-4 h-full flex flex-col justify-between">
        {/* Top row - always visible */}
        <div className="flex items-center gap-3">
          <div className={`
            rounded-lg bg-gradient-to-br from-sage/20 to-sage/10 
            p-2 backdrop-blur-sm border border-sage/20
            group-hover:border-sage/40 group-hover:from-sage/30 group-hover:to-sage/15
            transition-all duration-300
          `}>
            <Icon className="h-5 w-5 text-sage-dark" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm text-foreground truncate">
                {title}
              </h4>
              {badge !== undefined && badge > 0 && (
                <Badge 
                  variant="destructive" 
                  className="h-4 px-1.5 text-[10px] shrink-0"
                >
                  {badge}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Expanded content - shown on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2 space-y-2"
            >
              <p className="text-xs text-muted-foreground line-clamp-2">
                {description}
              </p>
              <Button 
                size="sm"
                variant="outline"
                className="w-full h-7 text-xs bg-sage/5 hover:bg-sage hover:text-white border-sage/20 hover:border-sage transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(path);
                }}
              >
                {action}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
