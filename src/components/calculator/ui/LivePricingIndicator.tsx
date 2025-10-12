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
        "flex flex-col gap-4 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-6 shadow-lg",
        className
      )}
    >
      <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary">
        <TrendingUp className="h-5 w-5" aria-hidden="true" /> Live Estimate
      </div>
      <div className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
        {formatCurrency(total)}
      </div>
      <p className="text-sm font-medium text-muted-foreground">
        Expected range: <span className="font-semibold text-foreground">{formatCurrency(lowEstimate)} – {formatCurrency(highEstimate)}</span>
      </p>
      {base ? (
        <p className="text-xs font-medium text-muted-foreground border-t border-primary/20 pt-3">
          Base scope: <span className="text-foreground">{formatCurrency(base)}</span>
        </p>
      ) : null}
    </div>
  )
}
