import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

import type { CalculatorAdder } from "@/lib/calculator/data-model"

type AdderSelectorProps = {
  value: string[]
  options: CalculatorAdder[]
  onChange: (adderId: string) => void
}

const CATEGORY_LABELS: Record<CalculatorAdder["category"], string> = {
  structural: "Structural",
  mep: "MEP",
  finishes: "Finishes",
}

const PRICE_LABEL = {
  fixed: (value: number) => `+€${value.toFixed(0)}`,
  per_sqm: (value: number) => `+€${value.toFixed(0)} / m²`,
  percentage: (value: number) => `+${(value * 100).toFixed(0)}%`,
}

export const AdderSelector = ({ value, options, onChange }: AdderSelectorProps) => {
  if (!options.length) {
    return null
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">One-tap adders</h3>
      <div className="space-y-3">
        {options.map((adder) => {
          const isActive = value.includes(adder.id)
          return (
            <div key={adder.id} className="flex items-start gap-4 rounded-2xl border border-muted bg-card p-4">
              <Switch checked={isActive} onCheckedChange={() => onChange(adder.id)} />
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold">{adder.name}</p>
                  <Badge variant="secondary">{CATEGORY_LABELS[adder.category]}</Badge>
                  <Badge variant="outline">{PRICE_LABEL[adder.priceType](adder.priceValue)}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{adder.description}</p>
                {adder.tooltip ? (
                  <p className="text-xs text-muted-foreground">{adder.tooltip}</p>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
