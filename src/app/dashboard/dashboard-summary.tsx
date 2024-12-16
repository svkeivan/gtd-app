import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'

interface DashboardSummaryProps {
  data: {
    inboxCount: number
    nextActionsCount: number
    projectsCount: number
    contextsCount: number
  }
}

export function DashboardSummary({ data }: DashboardSummaryProps) {
  const summaryItems = [
    { title: 'Inbox', count: data.inboxCount, link: '/inbox' },
    { title: 'Next Actions', count: data.nextActionsCount, link: '/next-actions' },
    { title: 'Projects', count: data.projectsCount, link: '/projects' },
    { title: 'Contexts', count: data.contextsCount, link: '/contexts' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {summaryItems.map((item) => (
            <Link href={item.link} key={item.title} className="block">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{item.count}</div>
                  <p className="text-xs text-muted-foreground">{item.title}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

