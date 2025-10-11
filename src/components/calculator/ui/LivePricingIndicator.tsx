import { TrendingUp } from "lucide-react"

import { cn } from "@/lib/utils"

type LivePricingIndicatorProps = {
  className?: string
  total: number
  lowEstimate: number
  highEstimate: number
  base?: number
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value)

export const LivePricingIndicator = ({
  className,
  total,
  lowEstimate,
  highEstimate,
  base,
}: LivePricingIndicatorProps) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-indigo-200 bg-indigo-500/10 p-6 text-indigo-900",
        className
      )}
    >
      <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-indigo-600">
        <TrendingUp className="h-4 w-4" aria-hidden="true" /> Live Pricing
      </div>
      <div className="text-4xl font-semibold text-indigo-950">{formatCurrency(total)}</div>
      <p className="text-sm text-muted-foreground">
        Expected range {formatCurrency(lowEstimate)} – {formatCurrency(highEstimate)}
      </p>
      {base ? (
        <p className="text-xs text-muted-foreground">Base scope estimate {formatCurrency(base)}</p>
      ) : null}
    </div>
  )
}
