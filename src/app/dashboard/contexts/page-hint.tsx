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

export function ContextsPageHint() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-muted-foreground" />
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="p-0 hover:bg-transparent">
            <span className="text-sm text-muted-foreground">
              Understanding Contexts in GTD
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
          <AlertTitle className="mb-2">What are Contexts?</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              In Getting Things Done (GTD), contexts are the conditions, tools, or locations needed to complete a task. They help you organize actions based on what you need or where you need to be to accomplish them.
            </p>
            <p>
              <strong>Common types of contexts:</strong>
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>
                <strong>Locations:</strong> @Home, @Office, @Store - tasks that can only be done in specific places
              </li>
              <li>
                <strong>Tools:</strong> @Computer, @Phone, @Internet - tasks requiring specific tools or devices
              </li>
              <li>
                <strong>People:</strong> @Team, @Boss, @Client - tasks involving interaction with specific people
              </li>
              <li>
                <strong>Energy Levels:</strong> @HighFocus, @LowEnergy - tasks categorized by required mental state
              </li>
            </ul>
            <p>
              <strong>Benefits of using contexts:</strong>
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>
                Quickly find relevant tasks based on your current situation
              </li>
              <li>
                Batch similar activities together for better efficiency
              </li>
              <li>
                Avoid context switching by focusing on tasks in the same context
              </li>
              <li>
                Make better decisions about what to do based on available resources
              </li>
            </ul>
            <p className="text-sm text-muted-foreground">
              💡 Tip: Create contexts that reflect your actual work patterns and environments. Keep them broad enough to be useful but specific enough to be meaningful.
            </p>
          </AlertDescription>
        </Alert>
      </CollapsibleContent>
    </Collapsible>
  );
}
