import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { CalculatorSelections } from '../hooks/useCalculatorState';
import type { PricingResult } from '../hooks/useCalculatorPricing';

interface PDFExportProps {
  selections: CalculatorSelections;
  pricing: PricingResult;
}

export function PDFExport({ selections, pricing }: PDFExportProps) {
  const { toast } = useToast();

  const generatePDF = async () => {
    try {
      toast({
        title: "Generating PDF...",
        description: "Your estimate is being prepared."
      });

      // Create a printable HTML view
      const content = buildPDFContent(selections, pricing);
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Popup blocked');
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Project Estimate - ${selections.projectType}</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 800px;
                margin: 40px auto;
                padding: 20px;
                line-height: 1.6;
                color: #333;
              }
              h1 {
                color: #1a1a1a;
                border-bottom: 3px solid #4f46e5;
                padding-bottom: 10px;
              }
              h2 {
                color: #4f46e5;
                margin-top: 30px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                margin: -20px -20px 30px -20px;
                border-radius: 8px 8px 0 0;
              }
              .price-box {
                background: #f8f9fa;
                border-left: 4px solid #4f46e5;
                padding: 20px;
                margin: 20px 0;
              }
              .price-box .amount {
                font-size: 32px;
                font-weight: bold;
                color: #4f46e5;
              }
              .breakdown {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin: 20px 0;
              }
              .breakdown-item {
                display: flex;
                justify-content: space-between;
                padding: 10px;
                background: #f8f9fa;
                border-radius: 4px;
              }
              .section {
                margin: 30px 0;
              }
              ul {
                list-style: none;
                padding: 0;
              }
              ul li:before {
                content: "✓";
                color: #4f46e5;
                font-weight: bold;
                margin-right: 10px;
              }
              .footer {
                margin-top: 50px;
                padding-top: 20px;
                border-top: 2px solid #e5e7eb;
                font-size: 12px;
                color: #6b7280;
              }
              @media print {
                body { margin: 0; padding: 20px; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${content}
            <div class="footer">
              <p><strong>Disclaimer:</strong> This is a planning estimate (±10%). Final quotes may vary based on site conditions, access, and specific material choices.</p>
              <p>Generated on ${new Date().toLocaleDateString()} | Valid for 30 days</p>
            </div>
          </body>
        </html>
      `);

      printWindow.document.close();
      
      // Wait for content to load, then print
      printWindow.onload = () => {
        printWindow.print();
      };

      toast({
        title: "PDF Ready",
        description: "Print dialog opened. Save as PDF to download."
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "PDF Generation Failed",
        description: "Unable to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button size="lg" variant="outline" onClick={generatePDF} className="gap-2">
      <Download className="h-4 w-4" />
      Download PDF
    </Button>
  );
}

function buildPDFContent(selections: CalculatorSelections, pricing: PricingResult): string {
  const projectType = selections.projectType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return `
    <div class="header">
      <h1>Project Estimate</h1>
      <p style="font-size: 18px; margin: 10px 0 0 0;">${projectType} - ${selections.qualityTier?.display_name} Quality</p>
    </div>

    <div class="price-box">
      <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">Estimated Cost Range</div>
      <div class="amount">€${pricing.min.toLocaleString()} - €${pricing.max.toLocaleString()}</div>
      <div style="margin-top: 10px; color: #6b7280;">
        <strong>Timeline:</strong> ${pricing.timeline} working days
      </div>
    </div>

    <div class="section">
      <h2>Project Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 10px; font-weight: bold;">Size:</td>
          <td style="padding: 10px;">${selections.sizePreset?.preset_name || 'Not specified'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 10px; font-weight: bold;">Quality Level:</td>
          <td style="padding: 10px;">${selections.qualityTier?.display_name || 'Not specified'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 10px; font-weight: bold;">Location:</td>
          <td style="padding: 10px;">${selections.locationFactor?.display_name || 'Not specified'}</td>
        </tr>
      </table>
    </div>

    <div class="section">
      <h2>Cost Breakdown</h2>
      <div class="breakdown">
        <div class="breakdown-item">
          <span>Labour</span>
          <strong>€${pricing.breakdown.labour.toLocaleString()}</strong>
        </div>
        <div class="breakdown-item">
          <span>Materials</span>
          <strong>€${pricing.breakdown.materials.toLocaleString()}</strong>
        </div>
        <div class="breakdown-item">
          <span>Permits & Admin</span>
          <strong>€${pricing.breakdown.permits.toLocaleString()}</strong>
        </div>
        <div class="breakdown-item">
          <span>Contingency</span>
          <strong>€${pricing.breakdown.contingency.toLocaleString()}</strong>
        </div>
        <div class="breakdown-item">
          <span>Waste Disposal</span>
          <strong>€${pricing.breakdown.disposal.toLocaleString()}</strong>
        </div>
      </div>
    </div>

    ${selections.scopeBundles.length > 0 ? `
    <div class="section">
      <h2>Scope of Work</h2>
      ${selections.scopeBundles.map(bundle => `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #1a1a1a; margin-bottom: 10px;">${bundle.display_name}</h3>
          <ul>
            ${bundle.included_items?.slice(0, 5).map(item => `<li>${item}</li>`).join('') || ''}
          </ul>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${selections.adders && selections.adders.length > 0 ? `
    <div class="section">
      <h2>Additional Requirements</h2>
      <ul>
        ${selections.adders.map(adder => `<li>${adder.display_name}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    ${pricing.recommendations && pricing.recommendations.length > 0 ? `
    <div class="section">
      <h2>Recommendations</h2>
      <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px;">
        <ul style="margin: 0;">
          ${pricing.recommendations.map(rec => `
            <li>${
              rec === 'structural_assessment' ? 'Consider adding a structural assessment for your extension project' :
              rec === 'premium_upgrades' ? 'Premium tier projects often benefit from underfloor heating and premium fixtures' :
              rec === 'extended_scope_benefits' ? 'Extended scope packages reduce coordination hassles and ensure cohesive finishes' :
              rec
            }</li>
          `).join('')}
        </ul>
      </div>
    </div>
    ` : ''}
  `;
}
