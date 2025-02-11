'use client'

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
          <CardTitle>GTD Workflow Distribution</CardTitle>
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
          <CardTitle>Project Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold">{data.projectHealth.totalProjects}</div>
              <div className="text-sm text-muted-foreground">Total Projects</div>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold">{data.projectHealth.activeProjects}</div>
              <div className="text-sm text-muted-foreground">Active Projects</div>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold">{data.projectHealth.projectsWithoutNextActions}</div>
              <div className="text-sm text-muted-foreground">Projects Needing Next Actions</div>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold">{data.projectHealth.avgNextActionsPerProject.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Avg Next Actions per Project</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Review Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Review Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold">{data.weeklyReviewStats.lastReviewDate || 'Never'}</div>
              <div className="text-sm text-muted-foreground">Last Review Date</div>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold">{data.weeklyReviewStats.reviewsLast30Days}</div>
              <div className="text-sm text-muted-foreground">Reviews in Last 30 Days</div>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold">{data.weeklyReviewStats.avgDaysBetweenReviews.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Avg Days Between Reviews</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Context Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Context Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.contextDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="context" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" name="Tasks" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Time to Completion */}
      <Card>
        <CardHeader>
          <CardTitle>Time to Completion by Priority</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.timeToCompletion.byPriority}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgDays" fill="#82ca9d" name="Average Days to Complete" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Task Completion Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Task Completion Trend</CardTitle>
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
                <Line type="monotone" dataKey="completed" stroke="#8884d8" name="Completed Tasks" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Project Progress Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Project Progress Trend</CardTitle>
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
                <Line type="monotone" dataKey="inProgress" stroke="#82ca9d" name="In Progress Projects" />
                <Line type="monotone" dataKey="completed" stroke="#8884d8" name="Completed Projects" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
