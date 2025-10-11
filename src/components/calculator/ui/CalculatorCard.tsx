import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

import { Card } from "@/components/ui/card"

type CalculatorCardProps = ComponentProps<typeof Card>

export const CalculatorCard = ({ className, ...props }: CalculatorCardProps) => {
  return (
    <Card
      className={cn(
        "border-none bg-gradient-to-br from-indigo-500/10 via-background to-background shadow-xl",
        className
      )}
      {...props}
    />
  )
}
