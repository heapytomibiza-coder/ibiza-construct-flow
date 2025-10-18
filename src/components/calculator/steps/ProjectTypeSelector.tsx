import type { ComponentType, SVGProps } from "react"

import { Building2, Grid3x3, ShowerHead, TreePine, UtensilsCrossed, Waves, Wind, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"

import type { ProjectType } from "@/lib/calculator/data-model"

type ProjectTypeSelectorProps = {
  value: ProjectType
  options: ProjectType[]
  onChange: (projectType: ProjectType) => void
}

const ICON_MAP: Record<ProjectType, ComponentType<SVGProps<SVGSVGElement>>> = {
  kitchen: UtensilsCrossed,
  bathroom: ShowerHead,
  extension: Building2,
  pool_outdoor: Waves,
  terrace_decking: Grid3x3,
  electrical_rewire: Zap,
  ac_installation: Wind,
  garden_structures: TreePine,
}

const LABELS: Record<ProjectType, string> = {
  kitchen: "Kitchen",
  bathroom: "Bathroom",
  extension: "Extension",
  pool_outdoor: "Pool & Outdoor Kitchen",
  terrace_decking: "Terrace & Decking",
  electrical_rewire: "Electrical Rewire",
  ac_installation: "Climate Control",
  garden_structures: "Garden & Structures",
}

export const ProjectTypeSelector = ({ value, options, onChange }: ProjectTypeSelectorProps) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Project type</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {options.map((option) => {
          const Icon = ICON_MAP[option]
          const isActive = value === option

          return (
            <Button
              key={option}
              variant={isActive ? "default" : "outline"}
              className="flex h-auto flex-col items-start gap-3 rounded-2xl border-2 p-4 text-left"
              onClick={() => onChange(option)}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  isActive ? "bg-indigo-600 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <div className="text-base font-semibold">{LABELS[option]}</div>
                <p className="text-xs text-muted-foreground">
                  {option === "kitchen" && "Perfect for remodels or new installs"}
                  {option === "bathroom" && "Upgrade ensuite, guest or spa bathrooms"}
                  {option === "extension" && "Add new habitable space or terraces"}
                  {option === "pool_outdoor" && "Pool renovations and outdoor cooking zones"}
                  {option === "terrace_decking" && "Decking, pergolas, and outdoor flooring"}
                  {option === "electrical_rewire" && "Complete property rewiring and upgrades"}
                  {option === "ac_installation" && "AC systems and climate control solutions"}
                  {option === "garden_structures" && "Casitas, chill-out zones, and garden buildings"}
                </p>
              </div>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
