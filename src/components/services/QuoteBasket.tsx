import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import type { BasketItem } from '@/hooks/useQuoteBasket';

interface Props {
  items: BasketItem[];
  notes: string;
  onNotesChange: (value: string) => void;
  totalEstimate: number;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  onRequestQuote: () => void;
  isSubmitting?: boolean;
  professionalName?: string;
  professionalAvatar?: string;
}

export const QuoteBasket: React.FC<Props> = ({
  items,
  notes,
  onNotesChange,
  totalEstimate,
  onUpdateQuantity,
  onRemove,
  onRequestQuote,
  isSubmitting,
  professionalName,
  professionalAvatar,
}) => {
  const describePrice = (item: BasketItem) => {
    switch (item.pricingType) {
      case 'fixed':
      case 'flat_rate':
        return `${item.pricePerUnit.toFixed(2)} € (precio fijo)`;
      case 'per_hour':
        return `${item.pricePerUnit.toFixed(2)} € / hora`;
      case 'per_unit':
        return `${item.pricePerUnit.toFixed(2)} € / ${item.unitLabel}`;
      case 'per_square_meter':
        return `${item.pricePerUnit.toFixed(2)} € / m²`;
      case 'per_project':
        return `${item.pricePerUnit.toFixed(2)} € / proyecto`;
      case 'range':
        return `Desde ${item.pricePerUnit.toFixed(2)} €`;
      case 'quote_required':
        return 'Precio bajo presupuesto';
      default:
        return `${item.pricePerUnit.toFixed(2)} €`;
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Tu presupuesto {items.length ? `(${items.length})` : ''}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {professionalName && (
          <div className="flex items-center gap-2 pb-2 border-b">
            {professionalAvatar ? (
              <img 
                src={professionalAvatar} 
                alt={professionalName}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-medium">
                  {professionalName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="text-sm">
              <p className="font-medium">{professionalName}</p>
              <p className="text-xs text-muted-foreground">Profesional</p>
            </div>
          </div>
        )}

        {!items.length && (
          <p className="text-sm text-muted-foreground">
            Añade tareas desde el menú para construir un presupuesto detallado y enviar la solicitud al profesional.
          </p>
        )}

        {items.length > 0 && (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-lg border p-3 text-sm bg-muted/20">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium text-foreground">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{describePrice(item)}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => onRemove(item.id)}
                  >
                    Quitar
                  </Button>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      aria-label="Disminuir cantidad"
                    >
                      -
                    </Button>
                    <span className="w-8 text-center text-xs">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </Button>
                  </div>
                  <div className="text-xs font-semibold text-foreground">
                    {item.subtotal.toFixed(2)} €
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Notas adicionales</label>
              <Textarea
                value={notes}
                onChange={(event) => onNotesChange(event.target.value)}
                placeholder="Cuéntanos fechas aproximadas, urgencia, acceso, materiales incluidos, etc."
                className="min-h-[80px]"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total estimado</p>
                <p className="text-2xl font-semibold">{totalEstimate.toFixed(2)} €</p>
              </div>
              <Button
                size="lg"
                disabled={!items.length || isSubmitting}
                onClick={onRequestQuote}
              >
                {isSubmitting ? 'Enviando...' : 'Solicitar presupuesto'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
