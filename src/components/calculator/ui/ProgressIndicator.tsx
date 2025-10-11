import { motion } from "framer-motion"

type ProgressIndicatorProps = {
  currentStep: number
  totalSteps: number
}

export const ProgressIndicator = ({ currentStep, totalSteps }: ProgressIndicatorProps) => {
  const percentage = Math.min(100, Math.round((currentStep / totalSteps) * 100))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span>Selections complete</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className="h-full rounded-full bg-indigo-500"
        />
      </div>
    </div>
  )
}
