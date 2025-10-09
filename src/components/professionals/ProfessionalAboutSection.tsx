import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, MapPin, Calendar, Shield } from 'lucide-react';

interface ProfessionalAboutSectionProps {
  bio?: string;
  yearsOfExperience?: number;
  certifications?: string[];
  skills?: string[];
  coverageArea?: string[];
  primaryTrade?: string;
  workPhilosophy?: string;
}

export const ProfessionalAboutSection = ({
  bio,
  yearsOfExperience,
  certifications,
  skills,
  coverageArea,
  primaryTrade,
  workPhilosophy
}: ProfessionalAboutSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bio */}
        {bio && (
          <div>
            <p className="text-muted-foreground leading-relaxed">{bio}</p>
          </div>
        )}

        {/* Work Philosophy */}
        {workPhilosophy && (
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/20">
            <h4 className="font-semibold mb-2 text-primary">Work Philosophy</h4>
            <p className="text-sm text-muted-foreground leading-relaxed italic">{workPhilosophy}</p>
          </div>
        )}

        {/* Key Information */}
        <div className="grid md:grid-cols-2 gap-4">
          {primaryTrade && (
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Primary Trade</p>
                <p className="font-semibold">{primaryTrade}</p>
              </div>
            </div>
          )}
          {yearsOfExperience && (
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Experience</p>
                <p className="font-semibold">{yearsOfExperience} years</p>
              </div>
            </div>
          )}
        </div>

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              Certifications & Licenses
            </h4>
            <div className="flex flex-wrap gap-2">
              {certifications.map((cert, index) => (
                <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Award className="w-3 h-3 mr-1" />
                  {cert}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Skills & Expertise</h4>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Coverage Area */}
        {coverageArea && coverageArea.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Service Area
            </h4>
            <div className="flex flex-wrap gap-2">
              {coverageArea.map((area, index) => (
                <Badge key={index} variant="outline">
                  {area}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
