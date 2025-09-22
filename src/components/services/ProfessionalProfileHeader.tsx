import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Star, MapPin, Award, Phone, Mail, Clock, CheckCircle } from 'lucide-react';

interface ProfessionalData {
  name: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  responseTime: string;
  location: string;
  certifications: string[];
  about: string;
  workingHours: string;
}

interface ProfessionalProfileHeaderProps {
  professional: ProfessionalData;
  showContactButtons?: boolean;
}

export const ProfessionalProfileHeader = ({ 
  professional, 
  showContactButtons = true 
}: ProfessionalProfileHeaderProps) => {
  return (
    <Card className="card-luxury p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {professional.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="text-xl font-bold text-charcoal">{professional.name}</h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{professional.location}</span>
              </div>
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{professional.rating}</span>
              <span className="text-muted-foreground">({professional.reviewCount.toLocaleString()} reviews)</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Responds in {professional.responseTime}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              <span>{professional.completedJobs}+ jobs completed</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {professional.certifications.map((cert, index) => (
              <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Award className="w-3 h-3 mr-1" />
                {cert}
              </Badge>
            ))}
          </div>
          
          <p className="text-muted-foreground">{professional.about}</p>
        </div>
        
        {showContactButtons && (
          <div className="flex gap-3">
            <Button size="lg" className="bg-copper hover:bg-copper/90">
              <Phone className="w-4 h-4 mr-2" />
              Call Now
            </Button>
            <Button variant="outline" size="lg">
              <Mail className="w-4 h-4 mr-2" />
              Message
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};