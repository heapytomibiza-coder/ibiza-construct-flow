import { CalendarDays } from "lucide-react"

import { LivePricingIndicator } from "../ui/LivePricingIndicator"

import type { PricingResultProps } from "@/lib/calculator/results/types"

export const LivePriceDisplay = ({ pricing }: PricingResultProps) => {
  return (
    <div className="space-y-4">
      <LivePricingIndicator
        total={pricing.total}
        lowEstimate={pricing.lowEstimate}
        highEstimate={pricing.highEstimate}
        base={pricing.base}
      />
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/60 p-4 text-sm text-indigo-900">
        <CalendarDays className="h-5 w-5" aria-hidden="true" />
        <div>
          <p className="font-medium">Typical programme</p>
          <p className="text-xs text-indigo-700">
            {pricing.timeline.minDays} – {pricing.timeline.maxDays} days including commissioning
          </p>
        </div>
      </div>
    </div>
  )
}
