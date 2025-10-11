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
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Where your budget goes</h3>
      <div className="space-y-2">
        {Object.entries(pricing.breakdown).map(([key, value]) => {
          const label = BREAKDOWN_LABELS[key] ?? key
          const percentage = total ? Math.round((value / total) * 100) : 0

          return (
            <Fragment key={key}>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{label}</span>
                <span>
                  {percentage}% · {formatCurrency(value)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
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
