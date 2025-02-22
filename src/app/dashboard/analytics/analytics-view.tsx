'use client'

import { persian } from "@/lib/persian";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

interface AnalyticsData {
  taskCompletionTrend: { date: string; completed: number }[]
  projectProgressTrend: { date: string; inProgress: number; completed: number }[]
  workflowMetrics: {
    inbox: number
    nextActions: number
    waitingFor: number
    projects: number
    somedayMaybe: number
    reference: number
  }
  contextDistribution: { context: string; count: number }[]
  weeklyReviewStats: {
    lastReviewDate: string | null
    reviewsLast30Days: number
    avgDaysBetweenReviews: number
  }
  timeToCompletion: {
    avgDays: number
    byPriority: { priority: number; avgDays: number }[]
  }
  projectHealth: {
    totalProjects: number
    activeProjects: number
    projectsWithoutNextActions: number
    avgNextActionsPerProject: number
  }
}

interface AnalyticsViewProps {
  data: AnalyticsData
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export function AnalyticsView({ data }: AnalyticsViewProps) {
  const workflowData = [
    { name: 'Inbox', value: data.workflowMetrics.inbox },
    { name: 'Next Actions', value: data.workflowMetrics.nextActions },
    { name: 'Waiting For', value: data.workflowMetrics.waitingFor },
    { name: 'Projects', value: data.workflowMetrics.projects },
    { name: 'Someday/Maybe', value: data.workflowMetrics.somedayMaybe },
    { name: 'Reference', value: data.workflowMetrics.reference },
  ]

  return (
    <div className="space-y-8">
      {/* GTD Workflow Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>{persian["GTD Workflow Distribution"] || "GTD Workflow Distribution"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={workflowData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  label
                >
                  {workflowData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Project Health Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>{persian["Project Health"] || "Project Health"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold">{data.projectHealth.totalProjects}</div>
              <div className="text-sm text-muted-foreground">{persian["Total Projects"] || "Total Projects"}</div>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold">{data.projectHealth.activeProjects}</div>
              <div className="text-sm text-muted-foreground">{persian["Active Projects"] || "Active Projects"}</div>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold">{data.projectHealth.projectsWithoutNextActions}</div>
              <div className="text-sm text-muted-foreground">{persian["Projects Needing Next Actions"] || "Projects Needing Next Actions"}</div>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold">{data.projectHealth.avgNextActionsPerProject.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">{persian["Avg Next Actions per Project"] || "Avg Next Actions per Project"}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Review Stats */}
      <Card>
        <CardHeader>
          <CardTitle>{persian["Weekly Review Health"] || "Weekly Review Health"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold">{data.weeklyReviewStats.lastReviewDate || persian["Never"] || 'Never'}</div>
              <div className="text-sm text-muted-foreground">{persian["Last Review Date"] || "Last Review Date"}</div>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold">{data.weeklyReviewStats.reviewsLast30Days}</div>
              <div className="text-sm text-muted-foreground">{persian["Reviews in Last 30 Days"] || "Reviews in Last 30 Days"}</div>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold">{data.weeklyReviewStats.avgDaysBetweenReviews.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">{persian["Avg Days Between Reviews"] || "Avg Days Between Reviews"}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Context Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>{persian["Context Distribution"] || "Context Distribution"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.contextDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="context" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" name={persian["Tasks"] || "Tasks"} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Time to Completion */}
      <Card>
        <CardHeader>
          <CardTitle>{persian["Time to Completion by Priority"] || "Time to Completion by Priority"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.timeToCompletion.byPriority}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgDays" fill="#82ca9d" name={persian["Average Days to Complete"] || "Average Days to Complete"} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Task Completion Trend */}
      <Card>
        <CardHeader>
          <CardTitle>{persian["Task Completion Trend"] || "Task Completion Trend"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.taskCompletionTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="completed" stroke="#8884d8" name={persian["Completed Tasks"] || "Completed Tasks"} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Project Progress Trend */}
      <Card>
        <CardHeader>
          <CardTitle>{persian["Project Progress Trend"] || "Project Progress Trend"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.projectProgressTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="inProgress" stroke="#82ca9d" name={persian["In Progress Projects"] || "In Progress Projects"} />
                <Line type="monotone" dataKey="completed" stroke="#8884d8" name={persian["Completed Projects"] || "Completed Projects"} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
