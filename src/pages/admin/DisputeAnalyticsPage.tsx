import React from "react";
import DisputeAnalyticsDashboard from "@/components/disputes/DisputeAnalyticsDashboard";
import EarlyWarningPanel from "@/components/disputes/EarlyWarningPanel";

export default function DisputeAnalyticsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DisputeAnalyticsDashboard />
        </div>
        <div>
          <EarlyWarningPanel />
        </div>
      </div>
    </div>
  );
}
