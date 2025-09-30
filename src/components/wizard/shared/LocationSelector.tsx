import React from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LocationSelectorProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

export const IBIZA_LOCATIONS = [
  // Main municipalities
  'Eivissa (Ibiza Town)',
  'Sant Antoni de Portmany',
  'Santa Eulària des Riu',
  'Sant Josep de sa Talaia',
  'Sant Joan de Labritja',
  
  // Popular areas and beaches
  'Playa d\'en Bossa',
  'Talamanca',
  'Jesús',
  'Can Pep Simó',
  'Puig d\'en Valls',
  'Sant Rafael',
  'Sant Antoni Bay',
  'Cala de Bou',
  'Port des Torrent',
  'Es Canar',
  'Cala Llonga',
  'Roca Llisa',
  'Cala Vadella',
  'Cala Jondal',
  'Cala d\'Hort',
  'Es Cubells',
  'Cala Comte',
  'Cala Bassa',
  'San Miguel',
  'Portinatx',
  'Benirràs',
  'Santa Gertrudis',
  'San Lorenzo',
  'Cala San Vicente',
  'Es Figueral',
  'Other area'
];

export const LocationSelector = ({ 
  value, 
  onChange, 
  required = false,
  className = '' 
}: LocationSelectorProps) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-charcoal mb-2">
        Where is this job located? {required && <span className="text-destructive">*</span>}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select location in Ibiza" />
        </SelectTrigger>
        <SelectContent>
          {IBIZA_LOCATIONS.map((location) => (
            <SelectItem key={location} value={location}>
              {location}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export const LocationSelectorCard = ({ 
  value, 
  onChange, 
  required = false 
}: LocationSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <LocationSelector 
          value={value} 
          onChange={onChange} 
          required={required}
        />
      </CardContent>
    </Card>
  );
};
