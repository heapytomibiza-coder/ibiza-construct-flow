import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, CheckCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
  verified: boolean;
  logo?: string;
}

interface CertificationBadgesProps {
  certifications?: Certification[];
}

const defaultCertifications: Certification[] = [
  {
    id: '1',
    name: 'Licensed Contractor',
    issuer: 'Balearic Islands',
    year: '2020',
    verified: true
  },
  {
    id: '2',
    name: 'Safety Certified',
    issuer: 'European Standards',
    year: '2021',
    verified: true
  },
  {
    id: '3',
    name: 'Quality Assurance',
    issuer: 'Professional Association',
    year: '2022',
    verified: true
  }
];

export const CertificationBadges = ({
  certifications = defaultCertifications
}: CertificationBadgesProps) => {
  if (!certifications || certifications.length === 0) return null;

  return (
    <Card className="card-luxury">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Certifications & Licenses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certifications.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-colors bg-gradient-to-br from-background to-muted/20"
            >
              {/* Verified Badge */}
              {cert.verified && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              {/* Logo or Icon */}
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                {cert.logo ? (
                  <img src={cert.logo} alt={cert.name} className="w-8 h-8 object-contain" />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-primary" />
                )}
              </div>

              {/* Content */}
              <h4 className="font-semibold mb-1 text-sm">{cert.name}</h4>
              <p className="text-xs text-muted-foreground mb-1">{cert.issuer}</p>
              <p className="text-xs text-muted-foreground">Since {cert.year}</p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
