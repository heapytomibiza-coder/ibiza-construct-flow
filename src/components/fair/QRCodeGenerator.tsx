/**
 * QR Code Generator Component
 * Generates QR codes for fair booth display
 */

import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';

interface QRCodeGeneratorProps {
  sector: {
    slug: string;
    name_es: string;
    name_en: string;
    description_es: string;
    description_en: string;
  };
  open: boolean;
  onClose: () => void;
  language: 'es' | 'en';
}

export function QRCodeGenerator({ sector, open, onClose, language }: QRCodeGeneratorProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const url = `${window.location.origin}/fair/${sector.slug}`;

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `qr-${sector.slug}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;

    const qrImage = canvas.toDataURL('image/png');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${language === 'es' ? sector.name_es : sector.name_en}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 40px;
            }
            .container {
              text-align: center;
              max-width: 600px;
            }
            h1 {
              font-size: 32px;
              margin-bottom: 16px;
              color: #1a1a1a;
            }
            p {
              font-size: 18px;
              color: #666;
              margin-bottom: 32px;
            }
            img {
              width: 400px;
              height: 400px;
              margin: 32px 0;
            }
            .url {
              font-size: 14px;
              color: #999;
              word-break: break-all;
            }
            @media print {
              body {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${language === 'es' ? sector.name_es : sector.name_en}</h1>
            <p>${language === 'es' ? sector.description_es : sector.description_en}</p>
            <img src="${qrImage}" alt="QR Code" />
            <p class="url">${url}</p>
            <p style="margin-top: 40px; font-size: 16px;">
              ${language === 'es' 
                ? 'Escanea para ver el perfil de ejemplo'
                : 'Scan to view example profile'}
            </p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {language === 'es' ? 'Código QR' : 'QR Code'}
          </DialogTitle>
          <DialogDescription>
            {language === 'es' 
              ? 'Descarga o imprime este código QR para tu stand'
              : 'Download or print this QR code for your booth'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sector Info */}
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">
              {language === 'es' ? sector.name_es : sector.name_en}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'es' ? sector.description_es : sector.description_en}
            </p>
          </div>

          {/* QR Code */}
          <div ref={qrRef} className="flex justify-center p-6 bg-white rounded-lg">
            <QRCodeSVG
              value={url}
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* URL */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground break-all">{url}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleDownload} className="flex-1" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {language === 'es' ? 'Descargar' : 'Download'}
            </Button>
            <Button onClick={handlePrint} className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              {language === 'es' ? 'Imprimir' : 'Print'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
