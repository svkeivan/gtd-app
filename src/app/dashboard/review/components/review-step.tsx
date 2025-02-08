"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { HelpCircle, ChevronRight, ChevronDown } from "lucide-react"

interface ReviewStepProps {
  id: string
  label: string
  tooltip: string
  isCompleted: boolean
  onToggle: (id: string) => void
  itemCount?: number
  helpContent?: string
  onViewItems?: () => void
}

export function ReviewStep({
  id,
  label,
  tooltip,
  isCompleted,
  onToggle,
  itemCount,
  helpContent,
  onViewItems,
}: ReviewStepProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={id}
              checked={isCompleted}
              onCheckedChange={() => onToggle(id)}
              className="h-5 w-5"
            />
            <label
              htmlFor={id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {label}
            </label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center space-x-2">
            {itemCount !== undefined && (
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs">
                {itemCount} items
              </span>
            )}
            {helpContent && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      {(helpContent || onViewItems) && isExpanded && (
        <CardContent className="space-y-4 pt-0">
          {helpContent && (
            <div className="rounded-lg bg-muted p-4 text-sm">
              {helpContent}
            </div>
          )}
          {onViewItems && (
            <Button
              variant="outline"
              size="sm"
              onClick={onViewItems}
              className="w-full"
            >
              View Items
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  )
}