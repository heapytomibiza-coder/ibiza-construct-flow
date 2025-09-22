import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';

interface Package {
  id: string;
  name: string;
  price: string;
  duration: string;
  features: string[];
  popular?: boolean;
  description: string;
}

interface ServicePackagesProps {
  packages: Package[];
  onSelectPackage: (packageId: string) => void;
}

export const ServicePackages = ({ packages, onSelectPackage }: ServicePackagesProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {packages.map((pkg) => (
        <Card 
          key={pkg.id} 
          className={`card-luxury relative ${pkg.popular ? 'ring-2 ring-copper' : ''}`}
        >
          {pkg.popular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-hero text-white px-4 py-1">
                <Star className="w-4 h-4 mr-1" />
                Most Popular
              </Badge>
            </div>
          )}
          
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-display text-xl text-charcoal">
              {pkg.name}
            </CardTitle>
            <div className="mt-2">
              <span className="text-3xl font-bold text-copper">{pkg.price}</span>
              <p className="text-sm text-muted-foreground mt-1">{pkg.duration}</p>
            </div>
          </CardHeader>
          
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              {pkg.description}
            </p>
            
            <ul className="space-y-3 mb-6">
              {pkg.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              className={`w-full ${pkg.popular ? 'btn-hero' : 'btn-secondary'}`}
              onClick={() => onSelectPackage(pkg.id)}
            >
              Select {pkg.name}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};