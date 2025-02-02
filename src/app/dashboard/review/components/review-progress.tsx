"use client"

import { Progress } from "@/components/ui/progress"

interface ReviewProgressProps {
  completedSteps: number
  totalSteps: number
}

export function ReviewProgress({ completedSteps, totalSteps }: ReviewProgressProps) {
  const progress = (completedSteps / totalSteps) * 100

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          {completedSteps} of {totalSteps} steps completed
        </span>
        <span className="font-medium">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      {completedSteps === totalSteps ? (
        <p className="text-sm text-green-600">
          🎉 Review complete! You can now finalize your review.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Complete all steps to finish your weekly review
        </p>
      )}
    </div>
  )
}