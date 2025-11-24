import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { DollarSign, Clock, FileText, TrendingUp } from "lucide-react";

export const GetPaidSlide = () => {
  return (
    <SlideLayout background="copper">
      <SlideTitle>Get Paid Securely</SlideTitle>
      <SlideSubtitle>
        Guaranteed payment through escrow - no more chasing invoices
      </SlideSubtitle>

      <div className="grid grid-cols-2 gap-6 mt-12">
        <div className="p-6 rounded-xl bg-background/80 backdrop-blur border border-sage-muted/30">
          <DollarSign className="h-10 w-10 text-copper mb-4" />
          <h4 className="font-bold text-lg mb-2">Automatic Escrow Releases</h4>
          <p className="text-muted-foreground">
            Funds are released automatically when milestones are approved
          </p>
        </div>

        <div className="p-6 rounded-xl bg-background/80 backdrop-blur border border-sage-muted/30">
          <Clock className="h-10 w-10 text-copper mb-4" />
          <h4 className="font-bold text-lg mb-2">Fast Payout Schedule</h4>
          <p className="text-muted-foreground">
            Receive payments within 24-48 hours of milestone completion
          </p>
        </div>

        <div className="p-6 rounded-xl bg-background/80 backdrop-blur border border-sage-muted/30">
          <FileText className="h-10 w-10 text-copper mb-4" />
          <h4 className="font-bold text-lg mb-2">Invoice Generation</h4>
          <p className="text-muted-foreground">
            Automated invoice creation for all completed work
          </p>
        </div>

        <div className="p-6 rounded-xl bg-background/80 backdrop-blur border border-sage-muted/30">
          <TrendingUp className="h-10 w-10 text-copper mb-4" />
          <h4 className="font-bold text-lg mb-2">Earnings Analytics</h4>
          <p className="text-muted-foreground">
            Track revenue, forecast income, and analyze payment trends
          </p>
        </div>
      </div>

      <div className="mt-8 text-center p-6 rounded-xl bg-background/80 backdrop-blur border border-sage-muted/30">
        <div className="text-2xl font-bold mb-2">Average Time to Get Paid</div>
        <div className="text-5xl font-bold text-copper">36 hours</div>
        <div className="text-muted-foreground mt-2">vs 45 days traditional invoicing</div>
      </div>
    </SlideLayout>
  );
};
