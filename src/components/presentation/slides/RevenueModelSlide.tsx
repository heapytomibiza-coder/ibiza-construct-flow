import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { DollarSign, CreditCard, Star, TrendingUp } from "lucide-react";

export const RevenueModelSlide = () => {
  return (
    <SlideLayout>
      <SlideTitle>Revenue Model</SlideTitle>
      <SlideSubtitle>Sustainable model that aligns with user success</SlideSubtitle>

      <div className="grid grid-cols-2 gap-8 mt-12">
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-gradient-to-br from-sage/10 to-sage/5 border border-sage/30">
            <h4 className="font-bold text-xl mb-4">For Clients</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-sage/20 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-sage" />
                </div>
                <div>
                  <div className="font-medium">FREE to post & browse</div>
                  <div className="text-sm text-muted-foreground">No listing fees</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-copper/10 to-copper/5 border border-copper/30">
            <h4 className="font-bold text-xl mb-4">For Professionals</h4>
            <div className="space-y-4">
              <div>
                <div className="font-bold mb-2">Monthly Subscriptions</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Basic</span>
                    <span className="font-medium">€49/month</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pro</span>
                    <span className="font-medium">€99/month</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Premium</span>
                    <span className="font-medium">€199/month</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-copper/20">
                <div className="font-medium mb-1">OR Commission Model</div>
                <div className="text-sm text-muted-foreground">
                  12-15% per completed job
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-card border border-sage-muted/30">
            <CreditCard className="h-10 w-10 text-copper mb-4" />
            <h4 className="font-bold text-lg mb-2">Transaction Fees</h4>
            <p className="text-muted-foreground mb-4">2.5% payment processing fee</p>
            <div className="text-sm text-muted-foreground">
              Covers SafePay escrow, payment processing, and dispute resolution
            </div>
          </div>

          <div className="p-6 rounded-xl bg-card border border-sage-muted/30">
            <Star className="h-10 w-10 text-copper mb-4" />
            <h4 className="font-bold text-lg mb-2">Premium Features</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Featured listing placements</li>
              <li>• Priority search ranking</li>
              <li>• Advanced analytics</li>
              <li>• Verified badge upgrades</li>
            </ul>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-copper/10 to-sage/10 border border-copper/30">
            <TrendingUp className="h-10 w-10 text-copper mb-4" />
            <h4 className="font-bold text-lg mb-2">Revenue Projection</h4>
            <div className="text-3xl font-bold text-copper">€2.4M ARR</div>
            <div className="text-sm text-muted-foreground mt-2">Year 3 target</div>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
};
