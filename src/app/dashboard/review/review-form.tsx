"use client";

import { completeWeeklyReview } from "@/actions/reviews";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppStore } from "@/lib/store";
import { ItemStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const reviewSteps = [
  { id: "collect", label: "Collect Loose Papers and Materials" },
  { id: "inbox", label: "Process Your Inbox" },
  { id: "empty-head", label: "Empty Your Head" },
  { id: "review-next-actions", label: "Review Next Actions Lists" },
  { id: "review-projects", label: "Review Project Lists" },
  { id: "review-waiting", label: "Review Waiting For List" },
  { id: "review-someday", label: "Review Someday/Maybe List" },
  { id: "review-calendar", label: "Review Calendar" },
];

export function ReviewForm({
  userId,
  initialReviewItems,
}: {
  userId: string;
  initialReviewItems: {
    inboxItems: { userId: string; id: string; title: string; notes: string | null; status: ItemStatus; priority: number; dueDate: Date | null; plannedDate: Date | null; estimated: number | null; projectId: string | null; createdAt: Date; updatedAt: Date; }[];
    nextActions: { userId: string; id: string; title: string; notes: string | null; status: ItemStatus; priority: number; dueDate: Date | null; plannedDate: Date | null; estimated: number | null; projectId: string | null; createdAt: Date; updatedAt: Date; }[];
    projects: { userId: string; id: string; title: string; status: string; createdAt: Date; updatedAt: Date; description: string | null; parentId: string | null; }[];
    waitingFor: { userId: string; id: string; title: string; notes: string | null; status: ItemStatus; priority: number; dueDate: Date | null; plannedDate: Date | null; estimated: number | null; projectId: string | null; createdAt: Date; updatedAt: Date; }[];
    somedayMaybe: { userId: string; id: string; title: string; notes: string | null; status: ItemStatus; priority: number; dueDate: Date | null; plannedDate: Date | null; estimated: number | null; projectId: string | null; createdAt: Date; updatedAt: Date; }[];
  };
}) {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const router = useRouter();
  const { setReviewItems } = useAppStore();

  const handleStepToggle = (stepId: string) => {
    setCompletedSteps((prev) =>
      prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId],
    );
  };

  const handleCompleteReview = async () => {
    await completeWeeklyReview(userId);
    setReviewItems(initialReviewItems);
    router.push("/next-actions");
  };

  return (
    <div className="space-y-4">
      {reviewSteps.map((step) => (
        <Card key={step.id}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Checkbox
                id={step.id}
                checked={completedSteps.includes(step.id)}
                onCheckedChange={() => handleStepToggle(step.id)}
              />
              <label
                htmlFor={step.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {step.label}
              </label>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step.id === "inbox" && (
              <p>Items to process: {initialReviewItems.inboxItems.length}</p>
            )}
            {step.id === "review-next-actions" && (
              <p>
                Next actions to review: {initialReviewItems.nextActions.length}
              </p>
            )}
            {step.id === "review-projects" && (
              <p>Projects to review: {initialReviewItems.projects.length}</p>
            )}
            {step.id === "review-waiting" && (
              <p>Waiting for items: {initialReviewItems.waitingFor.length}</p>
            )}
            {step.id === "review-someday" && (
              <p>
                Someday/Maybe items: {initialReviewItems.somedayMaybe.length}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
      <Button
        onClick={handleCompleteReview}
        disabled={completedSteps.length !== reviewSteps.length}
      >
        Complete Weekly Review
      </Button>
    </div>
  );
}
