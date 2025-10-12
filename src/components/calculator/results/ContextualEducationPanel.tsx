import { Lightbulb } from "lucide-react"

import type { PricingResultProps } from "@/lib/calculator/results/types"

export const ContextualEducationPanel = ({ pricing }: PricingResultProps) => {
  if (!pricing.notes.length) {
    return null
  }

  return (
    <div className="space-y-4 rounded-xl border-2 border-primary/20 bg-primary/5 p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary">
        <Lightbulb className="h-5 w-5" aria-hidden="true" /> Expert Tips
      </div>
      <ul className="space-y-3 text-sm">
        {pricing.notes.map((note) => (
          <li key={note} className="flex items-start gap-3 leading-relaxed">
            <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" aria-hidden="true" />
            <span className="text-foreground">{note}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
