import { motion } from "framer-motion"

type ProgressIndicatorProps = {
  currentStep: number
  totalSteps: number
}

export const ProgressIndicator = ({ currentStep, totalSteps }: ProgressIndicatorProps) => {
  const percentage = Math.min(100, Math.round((currentStep / totalSteps) * 100))

  return (
    <div className="flex-1 max-w-md">
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className="h-full rounded-full bg-primary"
        />
      </div>
    </div>
  )
}
