import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardData } from "../../actions/dashboard";
import { DashboardSummary } from "./dashboard-summary";
import { QuickAddForm } from "./quick-add-form";
import { RecentItemsList } from "./recent-items-list";
import { TodaysTasksList } from "./todays-tasks-list";

interface DashboardData {
  inboxCount: number;
  nextActionsCount: number;
  projectsCount: number;
  contextsCount: number;
  completedCount: number;
  todaysTasks: Array<{
    id: string;
    title: string;
    priority: number;
    project: {
      id: string;
      title: string;
    } | null;
    contexts: Array<{
      id: string;
      name: string;
    }>;
  }>;
  recentItems: Array<{
    id: string;
    title: string;
    status: string;
    project: {
      id: string;
      title: string;
      status: string;
      userId: string;
      createdAt: Date;
      updatedAt: Date;
      parentId: string | null;
    } | null;
    contexts: Array<{
      id: string;
      name: string;
      userId: string;
      createdAt: Date;
      updatedAt: Date;
    }>;
  }>;
}

interface User {
  id: string;
  name?: string;
  isLoggedIn: boolean;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getProgressStats(data: DashboardData) {
  const totalTasks = data.inboxCount + data.nextActionsCount;
  const completedTasks = data.completedCount || 0;
  const progressPercent = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  return {
    totalTasks,
    completedTasks,
    progressPercent,
  };
}

export default async function DashboardPage() {
  const { user } = (await auth()) as { user: User };

  if (!user || !user.isLoggedIn) {
    redirect("/login");
  }

  const dashboardData = await getDashboardData(user.id);
  const { totalTasks, completedTasks, progressPercent } =
    getProgressStats(dashboardData);

  return (
    <div className="container mx-auto space-y-6 p-4">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">
          {getGreeting()}, {user.name}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s your productivity overview for today
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <div className="space-y-6 md:col-span-4">
          <QuickAddForm userId={user.id} />

          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={progressPercent} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>
                    {completedTasks} of {totalTasks} tasks completed
                  </span>
                  <span className="font-medium">{progressPercent}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <DashboardSummary data={dashboardData} />
          <TodaysTasksList tasks={dashboardData.todaysTasks} />
        </div>

        <div className="md:col-span-3">
          <RecentItemsList items={dashboardData.recentItems} />
        </div>
      </div>
    </div>
  );
}
