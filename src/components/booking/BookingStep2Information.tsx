import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { BookingInformation } from '@/hooks/useBookingWizard';

interface BookingStep2InformationProps {
  wizard: any;
}

export const BookingStep2Information = ({ wizard }: BookingStep2InformationProps) => {
  const [formData, setFormData] = useState<BookingInformation>(
    wizard.bookingInfo || {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      propertyType: '',
      specialRequirements: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    wizard.setBookingInfo(formData);
    wizard.nextStep();
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Your Information</h2>
        <p className="text-muted-foreground">
          Please provide your contact details so we can reach you about this booking.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Service Address *</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="123 Main Street, City, State 12345"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="propertyType">Property Type *</Label>
          <Select 
            value={formData.propertyType}
            onValueChange={(value) => setFormData({ ...formData, propertyType: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="residential_house">Residential House</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="commercial">Commercial Building</SelectItem>
              <SelectItem value="office">Office</SelectItem>
              <SelectItem value="retail">Retail Space</SelectItem>
              <SelectItem value="industrial">Industrial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialRequirements">Special Requirements (Optional)</Label>
          <Textarea
            id="specialRequirements"
            value={formData.specialRequirements}
            onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
            placeholder="Any special instructions, access codes, parking information, etc."
            rows={4}
          />
        </div>

        <div className="flex justify-between pt-6 border-t">
          <Button 
            type="button"
            variant="outline"
            onClick={wizard.prevStep}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button 
            type="submit"
            size="lg"
            className="gap-2"
            disabled={!wizard.canProceed()}
          >
            Continue to Date & Time
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
};
