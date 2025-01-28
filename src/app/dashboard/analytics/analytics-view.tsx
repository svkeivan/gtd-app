'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface AnalyticsData {
  taskCompletionTrend: { date: string; completed: number }[]
  projectProgressTrend: { date: string; inProgress: number; completed: number }[]
}

interface AnalyticsViewProps {
  data: AnalyticsData
}

export function AnalyticsView({ data }: AnalyticsViewProps) {
  return (
    <div className="space-y-8">
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

