import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

import { Card } from "@/components/ui/card"

type CalculatorCardProps = ComponentProps<typeof Card>

export const CalculatorCard = ({ className, ...props }: CalculatorCardProps) => {
  return (
    <Card
      className={cn(
        "border-2 border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background shadow-lg hover:shadow-xl transition-shadow",
        className
      )}
      {...props}
    />
  )
}
