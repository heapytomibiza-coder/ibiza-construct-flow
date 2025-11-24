import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingCart } from '@/contexts/BookingCartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, Trash2, Plus, Minus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const BookingCart = () => {
  const navigate = useNavigate();
  const { items, totalItems, totalPrice, hasQuoteItems, removeItem, updateQuantity, clearCart } = useBookingCart();
  const [isOpen, setIsOpen] = useState(false);

  if (totalItems === 0) return null;

  const handleCheckout = () => {
    if (hasQuoteItems) {
      // Navigate to quote request flow
      navigate('/post?cart=true');
    } else {
      // Navigate to direct booking flow
      navigate('/checkout');
    }
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 px-6 rounded-full shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-5"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          <span className="font-semibold">Cart ({totalItems})</span>
          {!hasQuoteItems && (
            <Badge variant="secondary" className="ml-2">
              €{totalPrice.toFixed(2)}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Your Booking Cart</SheetTitle>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-destructive hover:text-destructive"
              >
                Clear All
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-12rem)] mt-6">
          <div className="space-y-4 pr-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                {/* Image */}
                {item.imageUrl && (
                  <div className="w-16 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={item.imageUrl}
                      alt={item.serviceName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-1">{item.serviceName}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    by {item.professionalName}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    {item.pricingType === 'quote_required' ? (
                      <Badge variant="secondary" className="text-xs">
                        Quote Required
                      </Badge>
                    ) : (
                      <>
                        {item.pricingType !== 'fixed' && (
                          <div className="flex items-center border rounded">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="px-2 text-xs min-w-[1.5rem] text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        <span className="text-sm font-semibold">
                          €{(item.pricePerUnit * item.quantity).toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 flex-shrink-0"
                  onClick={() => removeItem(item.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-background">
          <div className="space-y-4">
            {/* Total */}
            {!hasQuoteItems && (
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total</span>
                <span>€{totalPrice.toFixed(2)}</span>
              </div>
            )}

            {hasQuoteItems && (
              <div className="text-sm text-muted-foreground">
                * Some items require quotes - we'll help you get pricing
              </div>
            )}

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              className="w-full h-12 text-base"
              size="lg"
            >
              {hasQuoteItems ? 'Request Quotes' : 'Proceed to Booking'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
