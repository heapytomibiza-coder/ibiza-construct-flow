import { CheckCircle2, CircleX } from "lucide-react"

import type { PricingResultProps } from "@/lib/calculator/results/types"

export const InclusionExclusionList = ({ pricing }: PricingResultProps) => {
  const included = Array.from(new Set(pricing.bundles.flatMap((bundle) => bundle.included)))
  const excluded = Array.from(new Set(pricing.bundles.flatMap((bundle) => bundle.excluded)))

  if (!included.length && !excluded.length) {
    return null
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-emerald-700">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Included
        </div>
        <ul className="space-y-2 text-sm text-emerald-900">
          {included.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-3 rounded-xl border border-rose-200 bg-rose-50/70 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-rose-600">
          <CircleX className="h-4 w-4" aria-hidden="true" /> Not included
        </div>
        <ul className="space-y-2 text-sm text-rose-900">
          {excluded.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-rose-500" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
