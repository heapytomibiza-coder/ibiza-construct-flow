import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfessionalSettings() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              <div>
                <CardTitle>Services & Pricing</CardTitle>
                <CardDescription>
                  Manage the services you offer and your pricing structure
                </CardDescription>
              </div>
            </div>
            <Button onClick={() => navigate('/dashboard')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Full service management is available in your Professional Dashboard. 
            You can add, edit, and manage all your services, pricing, and availability there.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            Company details, VAT, insurance, and certifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Business information management coming soon
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio</CardTitle>
          <CardDescription>
            Showcase your work with photos and case studies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Portfolio management coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
