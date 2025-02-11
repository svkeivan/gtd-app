"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { useState } from "react";

export function NextActionsPageHint() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-muted-foreground" />
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="p-0 hover:bg-transparent">
            <span className="text-sm text-muted-foreground">
              Understanding Next Actions
            </span>
            {isOpen ? (
              <ChevronUp className="ml-1 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-1 h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="mt-2 transition-all">
        <Alert>
          <AlertTitle className="mb-2">What are Next Actions?</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              Next Actions are the concrete, physical next steps that move your
              projects forward. They answer the question: "What's the next physical
              action required to move this forward?"
            </p>
            <p>
              <strong>Key characteristics:</strong>
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>
                They are specific, actionable tasks (e.g., "Call John about project
                timeline" rather than "Discuss project")
              </li>
              <li>
                They can be done right away - no other tasks need to be completed
                first
              </li>
              <li>
                They are organized by context (where/how you'll do them) and
                project (what they contribute to)
              </li>
              <li>
                They can be prioritized and reordered based on importance and
                urgency
              </li>
            </ul>
            <p className="text-sm text-muted-foreground">
              💡 Tip: Review your Next Actions list regularly and keep it
              up-to-date by completing, rescheduling, or delegating tasks as
              needed.
            </p>
          </AlertDescription>
        </Alert>
      </CollapsibleContent>
    </Collapsible>
  );
}
