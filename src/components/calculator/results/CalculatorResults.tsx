import { CalculatorCard } from "../ui/CalculatorCard"

import { ContextualEducationPanel } from "./ContextualEducationPanel"
import { InclusionExclusionList } from "./InclusionExclusionList"
import { LivePriceDisplay } from "./LivePriceDisplay"
import { PriceBreakdownChart } from "./PriceBreakdownChart"
import type { PricingResultProps } from "@/lib/calculator/results/types"

export const CalculatorResults = ({ pricing }: PricingResultProps) => {
  return (
    <div className="space-y-6">
      <CalculatorCard className="p-6">
        <div className="space-y-6">
          <LivePriceDisplay pricing={pricing} />
          <PriceBreakdownChart pricing={pricing} />
          <InclusionExclusionList pricing={pricing} />
          <ContextualEducationPanel pricing={pricing} />
        </div>
      </CalculatorCard>
    </div>
  )
}
