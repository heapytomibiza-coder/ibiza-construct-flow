import { Slider } from "@/components/ui/slider"

import type { SizePreset } from "@/lib/calculator/data-model"

type SizePresetSelectorProps = {
  value: string
  options: SizePreset[]
  onChange: (sizePresetId: string) => void
}

export const SizePresetSelector = ({ value, options, onChange }: SizePresetSelectorProps) => {
  const activePreset = options.find((preset) => preset.id === value) ?? options[0]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Project size</h3>
        <span className="text-xs text-muted-foreground">
          {activePreset.min} – {activePreset.max} m²
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {options.map((preset) => {
          const isActive = preset.id === activePreset.id
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(preset.id)}
              className={`rounded-2xl border-2 p-4 text-left transition ${
                isActive
                  ? "border-indigo-500 bg-indigo-500/10 text-indigo-950"
                  : "border-muted bg-card text-muted-foreground hover:border-indigo-200"
              }`}
            >
              <div className="text-sm font-semibold">{preset.name}</div>
              <div className="text-xs opacity-80">
                {preset.min} – {preset.max} m²
              </div>
              <p className="mt-2 text-xs opacity-80">{preset.description}</p>
            </button>
          )
        })}
      </div>
      <div>
        <Slider
          value={[options.indexOf(activePreset)]}
          max={options.length - 1}
          step={1}
          onValueChange={(next) => {
            const index = next[0] ?? 0
            const selected = options[index]
            if (selected) {
              onChange(selected.id)
            }
          }}
          className="cursor-pointer"
        />
      </div>
    </div>
  )
}
