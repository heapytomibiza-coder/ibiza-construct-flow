import { Switch } from "@/components/ui/switch"

import type { ScopeBundle } from "@/lib/calculator/data-model"

type ScopeBundleSelectorProps = {
  value: string[]
  options: ScopeBundle[]
  onChange: (scopeBundleId: string) => void
}

export const ScopeBundleSelector = ({ value, options, onChange }: ScopeBundleSelectorProps) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Scope bundles</h3>
      <div className="space-y-3">
        {options.map((bundle) => {
          const isActive = value.includes(bundle.id)
          return (
            <div key={bundle.id} className="flex items-start gap-4 rounded-2xl border border-muted bg-card p-4">
              <Switch checked={isActive} onCheckedChange={() => onChange(bundle.id)} />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold">{bundle.name}</p>
                  {bundle.defaultSelected ? (
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Recommended</span>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">{bundle.description}</p>
                <p className="text-xs text-muted-foreground">Base rate +€{bundle.basePricePerSqm.toFixed(0)} per m²</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
