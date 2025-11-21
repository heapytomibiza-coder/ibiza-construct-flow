import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Edit, MapPin, Clock, Briefcase, Mail, Phone, User, Award } from 'lucide-react';

interface Step5ReviewProps {
  data: {
    displayName: string;
    tagline: string;
    bio: string;
    experienceYears: string;
    categories: string[];
    regions: string[];
    availability: string[];
    contactEmail: string;
    contactPhone: string;
    coverImageUrl?: string;
  };
  onEdit: (step: number) => void;
}

export function Step5Review({ data, onEdit }: Step5ReviewProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-2">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold">Looking Good! 🎉</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Review your profile before submitting for verification
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {/* Profile Preview */}
        <Card className="overflow-hidden">
          {data.coverImageUrl && (
            <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/10 relative">
              <img 
                src={data.coverImageUrl} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardContent className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <h3 className="text-2xl font-bold">{data.displayName}</h3>
                </div>
                <p className="text-lg text-muted-foreground">{data.tagline}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Award className="w-4 h-4" />
                  <span>{data.experienceYears} years experience</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onEdit(0)}>
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>

            {/* Bio & Contact */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">About</p>
                  <p className="leading-relaxed">{data.bio}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onEdit(1)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{data.contactEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{data.contactPhone}</span>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    Services ({data.categories.length})
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onEdit(2)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.categories.map((cat) => (
                  <Badge key={cat} variant="secondary">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Coverage & Availability */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex justify-between items-start">
                <div className="space-y-3 flex-1">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        Service Areas ({data.regions.length})
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {data.regions.map((region) => (
                        <Badge key={region} variant="outline" className="text-xs">
                          {region}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        Availability ({data.availability.length})
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {data.availability.map((avail) => (
                        <Badge key={avail} variant="outline" className="text-xs capitalize">
                          {avail}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onEdit(3)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps Info */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <CardContent className="p-6">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              What happens next?
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span>1️⃣</span>
                <span>Submit your profile for verification</span>
              </li>
              <li className="flex gap-2">
                <span>2️⃣</span>
                <span>Upload verification documents (ID, certifications)</span>
              </li>
              <li className="flex gap-2">
                <span>3️⃣</span>
                <span>We'll review within 1-2 business days</span>
              </li>
              <li className="flex gap-2">
                <span>4️⃣</span>
                <span>Once approved, configure your detailed services & pricing</span>
              </li>
              <li className="flex gap-2">
                <span>5️⃣</span>
                <span>Start receiving job requests!</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
