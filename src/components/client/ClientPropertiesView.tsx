import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  MapPin, Plus, Edit, Trash2, Key, Car, 
  Clock, Shield, Home, Camera, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Property {
  id: string;
  name: string;
  address: string;
  type: 'house' | 'apartment' | 'villa' | 'commercial';
  isDefault: boolean;
  accessNotes: string;
  parkingInfo: string;
  keyInfo: string;
  emergencyContact?: string;
  photos: string[];
  activeJobs: number;
  completedJobs: number;
  createdAt: string;
}

const mockProperties: Property[] = [
  {
    id: '1',
    name: 'Villa Marina',
    address: 'Carrer de la Marina, 25, 07800 Ibiza, Spain',
    type: 'villa',
    isDefault: true,
    accessNotes: 'Main entrance through the garden gate. Doorbell is on the left side. Please note that deliveries should go to the back entrance.',
    parkingInfo: 'Private driveway for 2 cars. Additional street parking available on Carrer de la Marina.',
    keyInfo: 'Key is in the lockbox by the front door (code: 1234). Spare key with neighbor at #27.',
    emergencyContact: '+34 123 456 789',
    photos: ['/api/placeholder/200/150', '/api/placeholder/200/150'],
    activeJobs: 2,
    completedJobs: 8,
    createdAt: '2023-06-15'
  },
  {
    id: '2',
    name: 'City Apartment',
    address: 'Avinguda de España, 12, 3º B, 07800 Ibiza, Spain',
    type: 'apartment',
    isDefault: false,
    accessNotes: 'Building entrance requires buzz. Apartment 3B, take elevator to 3rd floor.',
    parkingInfo: 'Underground garage, space #23. Remote control in kitchen drawer.',
    keyInfo: 'Keys with building concierge during business hours (9-18h).',
    photos: ['/api/placeholder/200/150'],
    activeJobs: 0,
    completedJobs: 3,
    createdAt: '2023-09-20'
  }
];

export const ClientPropertiesView = () => {
  const [properties, setProperties] = useState(mockProperties);
  const [editingProperty, setEditingProperty] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const getPropertyIcon = (type: string) => {
    switch (type) {
      case 'villa': return <Home className="w-5 h-5 text-copper" />;
      case 'apartment': return <Home className="w-5 h-5 text-blue-500" />;
      case 'house': return <Home className="w-5 h-5 text-green-500" />;
      case 'commercial': return <Home className="w-5 h-5 text-purple-500" />;
      default: return <Home className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const setDefaultProperty = (propertyId: string) => {
    setProperties(prev => prev.map(property => ({
      ...property,
      isDefault: property.id === propertyId
    })));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-charcoal">Properties</h2>
          <p className="text-muted-foreground">Manage your properties and access information</p>
        </div>
        <Button 
          className="bg-gradient-hero text-white"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {properties.map((property) => (
          <Card key={property.id} className="card-luxury">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getPropertyIcon(property.type)}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-semibold text-charcoal">{property.name}</h3>
                      {property.isDefault && (
                        <Badge className="bg-copper text-white">Default</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground capitalize">{property.type}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setEditingProperty(property.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Address */}
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{property.address}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-sand-light rounded-lg">
                  <div className="text-lg font-semibold text-charcoal">{property.activeJobs}</div>
                  <div className="text-xs text-muted-foreground">Active Jobs</div>
                </div>
                <div className="text-center p-3 bg-sand-light rounded-lg">
                  <div className="text-lg font-semibold text-charcoal">{property.completedJobs}</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="space-y-3">
                {/* Access Notes */}
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="text-sm font-medium text-charcoal">Access</h5>
                    <p className="text-xs text-muted-foreground line-clamp-2">{property.accessNotes}</p>
                  </div>
                </div>

                {/* Parking */}
                <div className="flex items-start gap-2">
                  <Car className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="text-sm font-medium text-charcoal">Parking</h5>
                    <p className="text-xs text-muted-foreground line-clamp-2">{property.parkingInfo}</p>
                  </div>
                </div>

                {/* Keys */}
                <div className="flex items-start gap-2">
                  <Key className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="text-sm font-medium text-charcoal">Keys</h5>
                    <p className="text-xs text-muted-foreground line-clamp-2">{property.keyInfo}</p>
                  </div>
                </div>
              </div>

              {/* Photos */}
              {property.photos.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-charcoal mb-2 flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Photos ({property.photos.length})
                  </h5>
                  <div className="flex gap-2">
                    {property.photos.slice(0, 3).map((photo, index) => (
                      <div key={index} className="w-16 h-12 bg-sand-light rounded border flex items-center justify-center">
                        <Camera className="w-4 h-4 text-muted-foreground" />
                      </div>
                    ))}
                    {property.photos.length > 3 && (
                      <div className="w-16 h-12 bg-sand-light rounded border flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">+{property.photos.length - 3}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-sand-dark/20">
                {!property.isDefault && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setDefaultProperty(property.id)}
                  >
                    Set as Default
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button size="sm" className="bg-gradient-hero text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Post Job Here
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Property Form */}
      {showAddForm && (
        <Card className="card-luxury border-copper/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-copper" />
              Add New Property
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-charcoal mb-1 block">Property Name</label>
                <Input placeholder="e.g., Villa Marina" />
              </div>
              <div>
                <label className="text-sm font-medium text-charcoal mb-1 block">Property Type</label>
                <select className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white">
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-charcoal mb-1 block">Address</label>
              <Input placeholder="Full address including postal code" />
            </div>

            <div>
              <label className="text-sm font-medium text-charcoal mb-1 block">Access Instructions</label>
              <Textarea 
                placeholder="How should professionals access the property? Include gate codes, doorbells, etc."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-charcoal mb-1 block">Parking Information</label>
                <Textarea 
                  placeholder="Parking availability and instructions"
                  rows={2}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-charcoal mb-1 block">Key Information</label>
                <Textarea 
                  placeholder="Where are keys located? Lockbox codes, etc."
                  rows={2}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-charcoal mb-1 block">Emergency Contact (Optional)</label>
              <Input placeholder="+34 123 456 789" />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-sand-dark/20">
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button className="bg-gradient-hero text-white">
                Add Property
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {properties.length === 0 && !showAddForm && (
        <Card className="card-luxury">
          <CardContent className="text-center py-12">
            <Home className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-display font-semibold mb-2">No properties added</h3>
            <p className="text-muted-foreground mb-6">
              Add your properties to help professionals understand access requirements and locations
            </p>
            <Button 
              className="bg-gradient-hero text-white"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Property
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};