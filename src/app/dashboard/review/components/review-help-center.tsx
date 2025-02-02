"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronRight, PlayCircle } from "lucide-react"

const bestPractices = [
  {
    title: "Collect Everything",
    content: "Gather all physical and digital items that need processing. Don't leave anything behind - papers, notes, emails, etc."
  },
  {
    title: "Process One Item at a Time",
    content: "Work through your inbox systematically. For each item, decide what it is and what needs to be done about it."
  },
  {
    title: "Make Clear Decisions",
    content: "For each item, decide: Is it actionable? If yes, what's the next action? If no, trash it, file it for reference, or add it to Someday/Maybe."
  },
  {
    title: "Review All Projects",
    content: "Ensure each project has a clear next action. Update project statuses and identify any stuck projects."
  },
  {
    title: "Keep Moving Forward",
    content: "Don't get bogged down in details. The goal is to review and update, not to do all the actions."
  }
]

const tutorials = [
  {
    title: "Weekly Review Overview",
    duration: "5:00",
    url: "https://youtube.com/gtd/weekly-review-overview"
  },
  {
    title: "Processing Your Inbox",
    duration: "7:30",
    url: "https://youtube.com/gtd/processing-inbox"
  },
  {
    title: "Project Planning",
    duration: "6:15",
    url: "https://youtube.com/gtd/project-planning"
  },
  {
    title: "Effective Next Actions",
    duration: "4:45",
    url: "https://youtube.com/gtd/next-actions"
  }
]

interface Section {
  title: string
  content: React.ReactNode
  isOpen?: boolean
}

export function ReviewHelpCenter() {
  const [sections, setSections] = useState<Section[]>([
    {
      title: "GTD Best Practices",
      content: (
        <div className="space-y-4">
          {bestPractices.map((practice, index) => (
            <div key={index} className="space-y-2">
              <h4 className="font-medium">{practice.title}</h4>
              <p className="text-sm text-muted-foreground">{practice.content}</p>
            </div>
          ))}
        </div>
      ),
      isOpen: true
    },
    {
      title: "Video Tutorials",
      content: (
        <div className="space-y-2">
          {tutorials.map((tutorial, index) => (
            <a
              key={index}
              href={tutorial.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted"
            >
              <div className="flex items-center space-x-3">
                <PlayCircle className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{tutorial.title}</span>
              </div>
              <span className="text-xs text-muted-foreground">{tutorial.duration}</span>
            </a>
          ))}
        </div>
      ),
      isOpen: false
    }
  ])

  const toggleSection = (index: number) => {
    setSections(prev =>
      prev.map((section, i) =>
        i === index ? { ...section, isOpen: !section.isOpen } : section
      )
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Help Center</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {sections.map((section, index) => (
              <div key={index} className="space-y-2">
                <Button
                  variant="ghost"
                  className="flex w-full items-center justify-between"
                  onClick={() => toggleSection(index)}
                >
                  <span className="font-medium">{section.title}</span>
                  {section.isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                {section.isOpen && (
                  <div className="rounded-lg border bg-card p-4">
                    {section.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}