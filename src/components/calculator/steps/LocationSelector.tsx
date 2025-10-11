import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import type { LocationFactor } from "@/lib/calculator/data-model"

type LocationSelectorProps = {
  value: string
  options: LocationFactor[]
  onChange: (locationId: string) => void
}

export const LocationSelector = ({ value, options, onChange }: LocationSelectorProps) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Location factor</h3>
      <RadioGroup value={value} onValueChange={onChange} className="grid gap-3 sm:grid-cols-3">
        {options.map((location) => {
          const isActive = location.id === value
          const id = `location-${location.id}`

          return (
            <div
              key={location.id}
              className={`rounded-2xl border-2 p-4 transition ${
                isActive
                  ? "border-indigo-500 bg-indigo-500/10 text-indigo-950"
                  : "border-muted bg-card text-muted-foreground hover:border-indigo-200"
              }`}
            >
              <RadioGroupItem value={location.id} id={id} className="sr-only" />
              <Label htmlFor={id} className="flex cursor-pointer flex-col gap-3 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-foreground">{location.name}</div>
                    <p className="text-xs text-muted-foreground">{location.notes}</p>
                  </div>
                  <div
                    className={`h-3 w-3 rounded-full border ${
                      isActive ? "border-indigo-600 bg-indigo-600" : "border-muted"
                    }`}
                  />
                </div>
                <p className="text-xs font-medium text-indigo-600">
                  {location.upliftPercentage > 0
                    ? `+${(location.upliftPercentage * 100).toFixed(0)}% uplift`
                    : "No uplift"}
                </p>
              </Label>
            </div>
          )
        })}
      </RadioGroup>
    </div>
  )
}
