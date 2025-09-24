import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, Minus, Clock, Euro, Calculator, Zap,
  Package, Wrench, Truck, Star, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  unit: 'item' | 'hour' | 'm2' | 'linear_m' | 'kg';
  category: 'labor' | 'material' | 'equipment' | 'addon';
  estimatedDuration?: number;
  popularity: number;
  image?: string;
  includes: string[];
  requiresQuantity?: boolean;
  minQuantity?: number;
  maxQuantity?: number;
}

interface SelectedItem extends MenuItem {
  quantity: number;
  customNotes?: string;
}

interface MenuBoardPricingProps {
  serviceId: string;
  onSelectionChange: (items: SelectedItem[], total: number, confidence: number) => void;
  initialItems?: SelectedItem[];
}

const MenuBoardPricing = ({ serviceId, onSelectionChange, initialItems = [] }: MenuBoardPricingProps) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>(initialItems);
  const [totalEstimate, setTotalEstimate] = useState(0);
  const [confidence, setConfidence] = useState(85);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // Mock data - in production, this would come from your API
  const mockMenuItems: MenuItem[] = [
    // Labor items
    {
      id: 'labor-1',
      name: 'Electrical Installation',
      description: 'Professional electrical work including wiring and connections',
      basePrice: 85,
      unit: 'hour',
      category: 'labor',
      estimatedDuration: 60,
      popularity: 95,
      includes: ['Licensed electrician', 'Basic materials', 'Safety inspection'],
      requiresQuantity: true,
      minQuantity: 1,
      maxQuantity: 12
    },
    {
      id: 'labor-2',
      name: 'Outlet Installation',
      description: 'Install new electrical outlet with proper grounding',
      basePrice: 75,
      unit: 'item',
      category: 'labor',
      estimatedDuration: 30,
      popularity: 88,
      includes: ['Installation', 'Testing', '1-year warranty'],
      requiresQuantity: true,
      minQuantity: 1,
      maxQuantity: 20
    },
    
    // Material items
    {
      id: 'material-1',
      name: 'Premium Cable (per meter)',
      description: 'High-grade electrical cable suitable for household use',
      basePrice: 12,
      unit: 'linear_m',
      category: 'material',
      popularity: 75,
      includes: ['Copper conductor', 'Insulation', 'Quality guarantee'],
      requiresQuantity: true,
      minQuantity: 5,
      maxQuantity: 100
    },
    {
      id: 'material-2',
      name: 'Circuit Breaker',
      description: 'Modern safety circuit breaker for electrical panel',
      basePrice: 45,
      unit: 'item',
      category: 'material',
      popularity: 82,
      includes: ['CE certified', '10-year warranty', 'Installation guide'],
      requiresQuantity: true,
      minQuantity: 1,
      maxQuantity: 10
    },

    // Equipment rental
    {
      id: 'equipment-1',
      name: 'Cable Detector',
      description: 'Professional cable detection equipment rental',
      basePrice: 25,
      unit: 'hour',
      category: 'equipment',
      popularity: 45,
      includes: ['Professional equipment', 'Usage instructions', 'Technical support'],
      requiresQuantity: true,
      minQuantity: 2,
      maxQuantity: 8
    },

    // Add-ons
    {
      id: 'addon-1',
      name: 'Same-Day Service',
      description: 'Priority scheduling for urgent jobs',
      basePrice: 50,
      unit: 'item',
      category: 'addon',
      popularity: 65,
      includes: ['Priority booking', 'Flexible timing', 'SMS updates'],
      requiresQuantity: false
    },
    {
      id: 'addon-2',
      name: 'Extended Warranty',
      description: '3-year extended warranty on all work',
      basePrice: 85,
      unit: 'item',
      category: 'addon',
      popularity: 55,
      includes: ['3-year coverage', 'Free repairs', '24/7 support'],
      requiresQuantity: false
    }
  ];

  const categories = [
    { id: 'all', name: 'All Items', icon: Package },
    { id: 'labor', name: 'Labor', icon: Wrench },
    { id: 'material', name: 'Materials', icon: Package },
    { id: 'equipment', name: 'Equipment', icon: Truck },
    { id: 'addon', name: 'Add-ons', icon: Zap }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setMenuItems(mockMenuItems);
      setLoading(false);
    }, 1000);
  }, [serviceId]);

  useEffect(() => {
    calculateTotal();
  }, [selectedItems]);

  const calculateTotal = () => {
    const total = selectedItems.reduce((sum, item) => {
      return sum + (item.basePrice * (item.requiresQuantity !== false ? item.quantity : 1));
    }, 0);
    
    setTotalEstimate(total);
    
    // Calculate confidence based on selection completeness
    const hasLabor = selectedItems.some(item => item.category === 'labor');
    const hasMaterials = selectedItems.some(item => item.category === 'material');
    const itemCount = selectedItems.length;
    
    let confidenceScore = 70; // Base confidence
    if (hasLabor) confidenceScore += 15;
    if (hasMaterials) confidenceScore += 10;
    if (itemCount >= 3) confidenceScore += 5;
    
    setConfidence(Math.min(95, confidenceScore));
    
    onSelectionChange(selectedItems, total, Math.min(95, confidenceScore));
  };

  const addItem = (item: MenuItem) => {
    const existing = selectedItems.find(s => s.id === item.id);
    if (existing) {
      updateQuantity(item.id, existing.quantity + 1);
    } else {
      const newItem: SelectedItem = {
        ...item,
        quantity: item.minQuantity || 1
      };
      setSelectedItems(prev => [...prev, newItem]);
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    const item = menuItems.find(m => m.id === itemId);
    if (!item) return;

    if (quantity <= 0) {
      setSelectedItems(prev => prev.filter(s => s.id !== itemId));
      return;
    }

    const minQty = item.minQuantity || 1;
    const maxQty = item.maxQuantity || 999;
    const validQuantity = Math.max(minQty, Math.min(maxQty, quantity));

    setSelectedItems(prev => prev.map(s => 
      s.id === itemId ? { ...s, quantity: validQuantity } : s
    ));
  };

  const getUnitLabel = (unit: string) => {
    switch (unit) {
      case 'hour': return 'per hour';
      case 'm2': return 'per m²';
      case 'linear_m': return 'per meter';
      case 'kg': return 'per kg';
      case 'item': return 'each';
      default: return 'each';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'labor': return Wrench;
      case 'material': return Package;
      case 'equipment': return Truck;
      case 'addon': return Zap;
      default: return Package;
    }
  };

  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Menu Items */}
      <div className="lg:col-span-2 space-y-6">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {category.name}
              </Button>
            );
          })}
        </div>

        {/* Items List */}
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const selected = selectedItems.find(s => s.id === item.id);
            const Icon = getCategoryIcon(item.category);
            
            return (
              <Card 
                key={item.id} 
                className={cn(
                  "transition-all hover:shadow-lg",
                  selected && "ring-2 ring-primary bg-primary/5"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            {item.name}
                            {item.popularity > 80 && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                Popular
                              </Badge>
                            )}
                          </h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="font-bold text-foreground">
                            €{item.basePrice}
                            <span className="text-sm text-muted-foreground ml-1">
                              {getUnitLabel(item.unit)}
                            </span>
                          </div>
                          {item.estimatedDuration && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="w-3 h-3 mr-1" />
                              {item.estimatedDuration}min
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {item.includes.slice(0, 2).map((include, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {include}
                            </Badge>
                          ))}
                          {item.includes.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.includes.length - 2} more
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {selected ? (
                            <div className="flex items-center gap-2">
                              {item.requiresQuantity !== false && (
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateQuantity(item.id, selected.quantity - 1)}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <Input
                                    type="number"
                                    value={selected.quantity}
                                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                    className="w-16 text-center text-sm"
                                    min={item.minQuantity || 1}
                                    max={item.maxQuantity || 999}
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateQuantity(item.id, selected.quantity + 1)}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateQuantity(item.id, 0)}
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              size="sm"
                              onClick={() => addItem(item)}
                              className="bg-gradient-hero text-white"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Price Summary */}
      <div className="space-y-4">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Price Estimate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedItems.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select items to see your estimate
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div className="flex-1">
                        <span className="font-medium">{item.name}</span>
                        {item.requiresQuantity !== false && (
                          <span className="text-muted-foreground ml-1">
                            x{item.quantity}
                          </span>
                        )}
                      </div>
                      <span className="font-medium">
                        €{((item.requiresQuantity !== false ? item.quantity : 1) * item.basePrice).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-xl">€{totalEstimate.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Confidence</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div 
                          className="bg-gradient-hero h-2 rounded-full transition-all"
                          style={{ width: `${confidence}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground">{confidence}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      Final price may vary based on site conditions and professional assessment. 
                      This estimate includes all selected items and services.
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MenuBoardPricing;