import { Info } from "lucide-react"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { Badge } from "@/components/ui/badge"

type EducationTooltipProps = {
  label: string
  description: string
}

export const EducationTooltip = ({ label, description }: EducationTooltipProps) => {
  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className="flex cursor-help items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-indigo-700">
            <Info className="h-4 w-4" aria-hidden="true" />
            <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-sm text-muted-foreground">
          {description}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
