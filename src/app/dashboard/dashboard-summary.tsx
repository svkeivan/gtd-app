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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Overview</span>
          <span className="text-sm font-normal text-muted-foreground">
            {new Date().toLocaleDateString()}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {summaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link href={item.link} key={item.title} className="group block">
                <Card className="transition-all duration-200 hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`${item.color} transition-transform group-hover:scale-110`}
                      >
                        <Icon size={24} />
                      </div>
                      <div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-2xl font-bold">
                            {item.count}
                          </span>
                          <span className="text-sm font-medium">
                            {item.title}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
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
