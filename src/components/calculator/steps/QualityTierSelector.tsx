import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import type { QualityTier } from "@/lib/calculator/data-model"

import { TierImageCarousel } from "../ui/TierImageCarousel"
import { EducationTooltip } from "../ui/EducationTooltip"

type QualityTierSelectorProps = {
  value: string
  options: QualityTier[]
  onChange: (qualityTierId: string) => void
}

export const QualityTierSelector = ({ value, options, onChange }: QualityTierSelectorProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Quality tier</h3>
        <EducationTooltip label="How tiers work" description="Multipliers adjust finish level, warranties, and brand sets." />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {options.map((tier) => {
          const isActive = tier.id === value
          return (
            <Button
              key={tier.id}
              onClick={() => onChange(tier.id)}
              type="button"
              variant={isActive ? "default" : "outline"}
              className="flex h-auto flex-col gap-4 rounded-3xl border-2 p-4 text-left"
            >
              <TierImageCarousel images={tier.imageUrls} className="w-full" />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-semibold">{tier.name}</div>
                  <p className="text-xs text-muted-foreground">{tier.description}</p>
                </div>
                <Badge variant="outline" className="rounded-full">
                  ×{tier.multiplier.toFixed(2)}
                </Badge>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {tier.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2">
                    <span className="mt-1 h-1 w-1 rounded-full bg-indigo-400" aria-hidden="true" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
