import { Lightbulb } from "lucide-react"

import type { PricingResultProps } from "@/lib/calculator/results/types"

export const ContextualEducationPanel = ({ pricing }: PricingResultProps) => {
  if (!pricing.notes.length) {
    return null
  }

  return (
    <div className="space-y-3 rounded-xl border border-indigo-200 bg-white/70 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-indigo-600">
        <Lightbulb className="h-4 w-4" aria-hidden="true" /> Planner tips
      </div>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {pricing.notes.map((note) => (
          <li key={note} className="flex items-start gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-indigo-400" aria-hidden="true" />
            {note}
          </li>
        ))}
      </ul>
    </div>
  )
}
