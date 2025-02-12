import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardData } from "../../actions/dashboard";
import { DashboardSummary } from "./dashboard-summary";
import { QuickAddForm } from "./quick-add-form";
import { RecentItemsList } from "./recent-items-list";
import { TodaysTasksList } from "./todays-tasks-list";
import { HabitList } from "./habits/habit-list";
import { HabitForm } from "./habits/habit-form";

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
    <div className="mx-auto max-w-7xl space-y-4 px-4 sm:space-y-6 sm:px-6 lg:px-8">
      <div className="flex flex-col space-y-1 sm:space-y-2">
        <h1 className="text-2xl font-bold sm:text-3xl">
          {getGreeting()}, {user.name}
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Here&apos;s your productivity overview for today
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-7">
        <div className="space-y-4 sm:space-y-6 lg:col-span-4">

          <Card>
            <CardHeader className="space-y-1.5 pb-4">
              <CardTitle className="text-lg sm:text-xl">Today&apos;s Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                <Progress value={progressPercent} className="h-2 sm:h-3" />
                <div className="flex justify-between text-xs sm:text-sm">
                  <span>
                    {completedTasks} of {totalTasks} tasks completed
                  </span>
                  <span className="font-medium">{progressPercent}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <DashboardSummary data={dashboardData} />
          <HabitList />
        </div>

        <div className="lg:col-span-3 flex flex-col gap-4">
          <QuickAddForm />
          <HabitForm />
          <TodaysTasksList tasks={dashboardData.todaysTasks} />
          <RecentItemsList items={dashboardData.recentItems} />
        </div>
      </div>
    </div>
  );
}
