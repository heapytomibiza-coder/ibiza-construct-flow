import { Fragment } from "react"

import type { PricingResultProps } from "@/lib/calculator/results/types"

const BREAKDOWN_LABELS: Record<string, string> = {
  labour: "Labour",
  materials: "Materials",
  permits: "Permits",
  contingency: "Contingency",
  disposal: "Waste & logistics",
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value)

export const PriceBreakdownChart = ({ pricing }: PricingResultProps) => {
  const total = Object.values(pricing.breakdown).reduce((sum, value) => sum + value, 0)

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold uppercase tracking-wider text-foreground">Budget Breakdown</h3>
      <div className="space-y-3">
        {Object.entries(pricing.breakdown).map(([key, value]) => {
          const label = BREAKDOWN_LABELS[key] ?? key
          const percentage = total ? Math.round((value / total) * 100) : 0

          return (
            <Fragment key={key}>
              <div className="flex items-center justify-between text-sm font-medium">
                <span className="text-foreground">{label}</span>
                <span className="text-muted-foreground">
                  {percentage}% · <span className="text-foreground font-semibold">{formatCurrency(value)}</span>
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted border border-border">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-primary/80 to-primary/60 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
