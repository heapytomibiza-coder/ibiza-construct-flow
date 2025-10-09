import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Facebook, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Globe,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SocialLink {
  platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'website';
  url: string;
}

interface SocialLinksProps {
  links?: SocialLink[];
  professionalName?: string;
}

const iconMap = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
  website: Globe
};

const colorMap = {
  facebook: 'hover:bg-blue-500 hover:text-white',
  instagram: 'hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 hover:text-white',
  linkedin: 'hover:bg-blue-600 hover:text-white',
  twitter: 'hover:bg-sky-500 hover:text-white',
  website: 'hover:bg-primary hover:text-primary-foreground'
};

export const SocialLinks = ({
  links = [],
  professionalName = 'this professional'
}: SocialLinksProps) => {
  if (!links || links.length === 0) return null;

  return (
    <Card className="card-luxury">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Connect Online
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Follow {professionalName} on social media
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {links.map((link, index) => {
            const Icon = iconMap[link.platform];
            const colorClass = colorMap[link.platform];
            
            return (
              <motion.div
                key={link.platform}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="icon"
                  asChild
                  className={`w-12 h-12 rounded-full transition-all touch-target ${colorClass}`}
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit ${link.platform} profile`}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
