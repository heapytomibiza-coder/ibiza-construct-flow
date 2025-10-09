import { Users, Award, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface SocialProofBannerProps {
  totalClients?: number;
  satisfactionRate?: number;
  yearsInBusiness?: number;
  responseRate?: number;
}

export const SocialProofBanner = ({
  totalClients = 150,
  satisfactionRate = 98,
  yearsInBusiness = 5,
  responseRate = 100
}: SocialProofBannerProps) => {
  const stats = [
    {
      icon: Users,
      value: `${totalClients}+`,
      label: 'Happy Clients',
      color: 'text-blue-500'
    },
    {
      icon: Award,
      value: `${satisfactionRate}%`,
      label: 'Satisfaction Rate',
      color: 'text-green-500'
    },
    {
      icon: TrendingUp,
      value: `${yearsInBusiness}+`,
      label: 'Years Experience',
      color: 'text-purple-500'
    },
    {
      icon: Zap,
      value: `${responseRate}%`,
      label: 'Response Rate',
      color: 'text-orange-500'
    }
  ];

  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-xl p-6 border border-primary/20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div className="flex justify-center mb-2">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-${stat.color.split('-')[1]}-100 to-${stat.color.split('-')[1]}-50 flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <motion.p 
                className="text-3xl font-bold mb-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2, type: 'spring', stiffness: 200 }}
              >
                {stat.value}
              </motion.p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};