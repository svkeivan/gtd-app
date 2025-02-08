"use client"

import { completeWeeklyReview } from "@/actions/reviews"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { ItemStatus, PriorityLevel } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useState, useCallback } from "react"
import { ReviewStep } from "./components/review-step"
import { ReviewProgress } from "./components/review-progress"
import { ReviewHelpCenter } from "./components/review-help-center"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useHotkeys } from "react-hotkeys-hook"

const reviewSteps = [
  {
    id: "collect",
    label: "Collect Loose Papers and Materials",
    tooltip: "Gather all physical and digital items that need processing",
    helpContent: "Start by collecting all loose papers, receipts, business cards, and digital notes. Check your desk, bags, and digital inboxes. The goal is to get everything into your GTD system."
  },
  {
    id: "inbox",
    label: "Process Your Inbox",
    tooltip: "Go through all collected items and decide what to do with them",
    helpContent: "Process means deciding what each item is and what needs to be done about it. Ask yourself: Is it actionable? If yes, what's the next action? If no, trash it, file it, or add it to Someday/Maybe."
  },
  {
    id: "empty-head",
    label: "Empty Your Head",
    tooltip: "Capture any remaining thoughts or ideas",
    helpContent: "Take time to write down any thoughts, ideas, or commitments that are still in your head. Don't try to organize them yet - just get them captured in your inbox."
  },
  {
    id: "review-next-actions",
    label: "Review Next Actions Lists",
    tooltip: "Review and update your list of next actions",
    helpContent: "Go through your next actions list. Mark off completed items, add new next actions from your inbox processing, and ensure each action is still relevant and clearly defined."
  },
  {
    id: "review-projects",
    label: "Review Project Lists",
    tooltip: "Review all projects and their next actions",
    helpContent: "Review each project. Does it have a clear next action? Is it moving forward? Should it be put on hold? Do any new projects need to be created from your inbox processing?"
  },
  {
    id: "review-waiting",
    label: "Review Waiting For List",
    tooltip: "Check status of delegated items and follow up if needed",
    helpContent: "Review items you're waiting for from others. Should you follow up? Have any been completed? Are any no longer relevant?"
  },
  {
    id: "review-someday",
    label: "Review Someday/Maybe List",
    tooltip: "Review items for future consideration",
    helpContent: "Look through your Someday/Maybe list. Should any items move to active projects? Are any no longer interesting? Add new items from your inbox processing."
  },
  {
    id: "review-calendar",
    label: "Review Calendar",
    tooltip: "Review past and upcoming calendar items",
    helpContent: "Look at your calendar: past (for action items or reference info to capture) and future (for preparation needed). Ensure all time-specific actions are captured."
  }
]

export function ReviewForm({
  userId,
  initialReviewItems,
}: {
  userId: string
  initialReviewItems: {
    inboxItems: { userId: string; id: string; title: string; notes: string | null; status: ItemStatus; priority: PriorityLevel; dueDate: Date | null; plannedDate: Date | null; estimated: number | null; projectId: string | null; createdAt: Date; updatedAt: Date; requiresFocus: boolean }[]
    nextActions: { userId: string; id: string; title: string; notes: string | null; status: ItemStatus; priority: PriorityLevel; dueDate: Date | null; plannedDate: Date | null; estimated: number | null; projectId: string | null; createdAt: Date; updatedAt: Date; requiresFocus: boolean }[]
    projects: { userId: string; id: string; title: string; status: string; createdAt: Date; updatedAt: Date; description: string | null; parentId: string | null }[]
    waitingFor: { userId: string; id: string; title: string; notes: string | null; status: ItemStatus; priority: PriorityLevel; dueDate: Date | null; plannedDate: Date | null; estimated: number | null; projectId: string | null; createdAt: Date; updatedAt: Date; requiresFocus: boolean }[]
    somedayMaybe: { userId: string; id: string; title: string; notes: string | null; status: ItemStatus; priority: PriorityLevel; dueDate: Date | null; plannedDate: Date | null; estimated: number | null; projectId: string | null; createdAt: Date; updatedAt: Date; requiresFocus: boolean }[]
  }
}) {
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("review")
  const router = useRouter()
  const { setReviewItems } = useAppStore()

  const handleStepToggle = useCallback((stepId: string) => {
    setCompletedSteps(prev =>
      prev.includes(stepId)
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    )
  }, [])

  const handleCompleteReview = async () => {
    await completeWeeklyReview(userId)
    setReviewItems(initialReviewItems)
    router.push("/dashboard/next-actions")
  }

  const handleViewItems = useCallback((type: string) => {
    router.push(`/dashboard/${type}`)
  }, [router])

  // Keyboard shortcuts
  useHotkeys("shift+n", () => handleViewItems("next-actions"))
  useHotkeys("shift+i", () => handleViewItems("inbox"))
  useHotkeys("shift+p", () => handleViewItems("projects"))
  useHotkeys("shift+w", () => handleViewItems("waiting"))
  useHotkeys("shift+s", () => handleViewItems("someday"))
  useHotkeys("shift+c", () => handleViewItems("calendar"))
  useHotkeys("shift+h", () => setActiveTab(prev => prev === "review" ? "help" : "review"))

  return (
    <div className="space-y-6">
      <ReviewProgress
        completedSteps={completedSteps.length}
        totalSteps={reviewSteps.length}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="review">Review Steps</TabsTrigger>
          <TabsTrigger value="help">Help & Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="review" className="space-y-4 pt-4">
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium">Keyboard Shortcuts:</p>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li>Shift + N: View Next Actions</li>
              <li>Shift + I: View Inbox</li>
              <li>Shift + P: View Projects</li>
              <li>Shift + W: View Waiting For</li>
              <li>Shift + S: View Someday/Maybe</li>
              <li>Shift + C: View Calendar</li>
              <li>Shift + H: Toggle Help</li>
            </ul>
          </div>

          <div className="space-y-4">
            {reviewSteps.map(step => (
              <ReviewStep
                key={step.id}
                id={step.id}
                label={step.label}
                tooltip={step.tooltip}
                helpContent={step.helpContent}
                isCompleted={completedSteps.includes(step.id)}
                onToggle={handleStepToggle}
                itemCount={
                  step.id === "inbox"
                    ? initialReviewItems.inboxItems.length
                    : step.id === "review-next-actions"
                    ? initialReviewItems.nextActions.length
                    : step.id === "review-projects"
                    ? initialReviewItems.projects.length
                    : step.id === "review-waiting"
                    ? initialReviewItems.waitingFor.length
                    : step.id === "review-someday"
                    ? initialReviewItems.somedayMaybe.length
                    : undefined
                }
                onViewItems={
                  step.id === "inbox"
                    ? () => handleViewItems("inbox")
                    : step.id === "review-next-actions"
                    ? () => handleViewItems("next-actions")
                    : step.id === "review-projects"
                    ? () => handleViewItems("projects")
                    : step.id === "review-waiting"
                    ? () => handleViewItems("waiting")
                    : step.id === "review-someday"
                    ? () => handleViewItems("someday")
                    : step.id === "review-calendar"
                    ? () => handleViewItems("calendar")
                    : undefined
                }
              />
            ))}
          </div>

          <Button
            onClick={handleCompleteReview}
            disabled={completedSteps.length !== reviewSteps.length}
            className="w-full"
          >
            Complete Weekly Review
          </Button>
        </TabsContent>

        <TabsContent value="help" className="pt-4">
          <ReviewHelpCenter />
        </TabsContent>
      </Tabs>
    </div>
  )
}
