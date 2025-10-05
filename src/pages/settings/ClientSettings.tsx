import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, CreditCard, Heart } from 'lucide-react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

export default function ClientSettings() {
  return (
    <div className="space-y-6">
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/dashboard/client' },
          { label: 'Settings', href: '/settings' },
          { label: 'Client Preferences' }
        ]}
      />
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Manage your payment methods and billing details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">No payment methods added</p>
                <p className="text-sm text-muted-foreground">
                  Add a payment method to book services
                </p>
              </div>
            </div>
            <Button>Add Payment Method</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Properties & Addresses</CardTitle>
          <CardDescription>
            Manage your service locations and saved addresses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Home className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">No properties added</p>
                <p className="text-sm text-muted-foreground">
                  Add your property to quickly book services
                </p>
              </div>
            </div>
            <Button>Add Property</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Favorite Professionals</CardTitle>
          <CardDescription>
            Manage your saved professionals for quick booking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">No favorites yet</p>
                <p className="text-sm text-muted-foreground">
                  Save professionals to quickly book them again
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
