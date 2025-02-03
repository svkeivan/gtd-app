import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, FolderGit2, Inbox, Tags } from "lucide-react";
import Link from "next/link";

interface DashboardSummaryProps {
  data: {
    inboxCount: number;
    nextActionsCount: number;
    projectsCount: number;
    contextsCount: number;
  };
}

export function DashboardSummary({ data }: DashboardSummaryProps) {
  const summaryItems = [
    {
      title: "Inbox",
      count: data.inboxCount,
      link: "/dashboard/inbox",
      icon: Inbox,
      color: "text-blue-500",
      description: "Capture your thoughts",
    },
    {
      title: "Next Actions",
      count: data.nextActionsCount,
      link: "/dashboard/next-actions",
      icon: CheckSquare,
      color: "text-green-500",
      description: "Ready to do",
    },
    {
      title: "Projects",
      count: data.projectsCount,
      link: "/dashboard/projects",
      icon: FolderGit2,
      color: "text-purple-500",
      description: "Track your goals",
    },
    {
      title: "Contexts",
      count: data.contextsCount,
      link: "/dashboard/contexts",
      icon: Tags,
      color: "text-orange-500",
      description: "Organize by context",
    },
  ];

  return (
    <Card className="sm:hover:shadow-md transition-shadow duration-200">
      <CardHeader className="space-y-1.5 pb-4">
        <CardTitle className="flex items-center justify-between text-lg sm:text-xl">
          <span>Overview</span>
          <span className="text-xs sm:text-sm font-normal text-muted-foreground">
            {new Date().toLocaleDateString()}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {summaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link href={item.link} key={item.title} className="group block">
                <Card className="transition-all duration-200 hover:shadow-md hover:translate-y-[-2px]">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div
                        className={`${item.color} transition-transform group-hover:scale-110`}
                      >
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div>
                        <div className="flex items-baseline gap-1.5 sm:gap-2">
                          <span className="text-xl font-bold sm:text-2xl">
                            {item.count}
                          </span>
                          <span className="text-xs font-medium sm:text-sm">
                            {item.title}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground sm:mt-1">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
