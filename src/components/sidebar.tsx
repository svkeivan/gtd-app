"use client";

import { logout } from "@/actions/auth";
import { getProfile } from "@/actions/profile";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  BarChart2,
  Boxes,
  Calendar,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Clock,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  Tags,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";

type Profile = {
  id: string;
  name: string | null;
  email: string;
  language: string;
  theme: string;
  timezone: string;
  avatar: string | null;
  profileComplete: boolean;
};

export function Sidebar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getProfile();
        setProfile(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to fetch profile");
        console.error("Failed to fetch profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const navItems = [
    // Task Workflow
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      category: "overview",
    },
    {
      href: "/dashboard/inbox",
      label: "Inbox",
      icon: Inbox,
      category: "workflow",
    },
    {
      href: "/dashboard/next-actions",
      label: "Next Actions",
      icon: CheckSquare,
      category: "workflow",
    },
    {
      href: "/dashboard/review",
      label: "Review",
      icon: RefreshCw,
      category: "workflow",
    },

    // Basic Data
    {
      href: "/dashboard/projects",
      label: "Projects",
      icon: FolderKanban,
      category: "data",
    },
    {
      href: "/dashboard/contexts",
      label: "Contexts",
      icon: Boxes,
      category: "data",
    },
    { href: "/dashboard/tags", label: "Tags", icon: Tags, category: "data" },

    // Tools & Analysis
    {
      href: "/dashboard/calendar",
      label: "Calendar",
      icon: Calendar,
      category: "tools",
    },
    {
      href: "/dashboard/time-tracking",
      label: "Time Tracking",
      icon: Clock,
      category: "tools",
    },
    {
      href: "/dashboard/analytics",
      label: "Analytics",
      icon: BarChart2,
      category: "tools",
    },
  ];

  const categories = {
    overview: "Overview",
    workflow: "Task Workflow",
    data: "Organization",
    tools: "Tools & Analysis",
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed left-4 top-4 z-50 rounded-md p-2 text-muted-foreground hover:bg-accent lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen bg-background shadow-lg transition-all duration-300 ease-in-out
          ${isCollapsed ? "w-20" : "w-64"} 
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b px-4">
            <Link
              href="/"
              className={`group flex items-center gap-2 transition-transform duration-200 hover:scale-105
                ${isCollapsed ? "justify-center" : "text-xl font-bold"}`}
            >
              {isCollapsed ? (
                <span className="text-2xl font-bold text-blue-600">G</span>
              ) : (
                <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  GTD App
                </span>
              )}
            </Link>
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <nav className="flex-1 space-y-4 overflow-y-auto p-4">
            {Object.entries(categories).map(([category, title]) => (
              <div key={category} className="space-y-1.5">
                {!isCollapsed && (
                  <div className="px-2 text-sm font-semibold text-muted-foreground">
                    {title}
                  </div>
                )}
                {navItems
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <Link key={item.href} href={item.href} className="block">
                      <Button
                        variant={pathname === item.href ? "secondary" : "ghost"}
                        className={`w-full justify-start text-left transition-all duration-200 hover:translate-x-1 ${
                          pathname === item.href
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 font-medium text-primary-foreground shadow-md"
                            : "hover:bg-accent"
                        } ${isCollapsed ? "px-3" : ""}`}
                      >
                        <item.icon className={`h-4 w-4 ${!isCollapsed && "mr-3"}`} />
                        {!isCollapsed && item.label}
                      </Button>
                    </Link>
                  ))}
              </div>
            ))}
          </nav>

          <div className="space-y-4 border-t p-4">
            {isLoading ? (
              <div className="flex items-center gap-3 px-3 py-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                {!isCollapsed && (
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                )}
              </div>
            ) : error ? (
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:bg-destructive/20"
                onClick={() => window.location.reload()}
              >
                {isCollapsed ? (
                  <span className="text-xl">!</span>
                ) : (
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">Error Loading Profile</span>
                    <span className="text-xs">Click to retry</span>
                  </div>
                )}
              </Button>
            ) : (
              <Link href="/dashboard/profile">
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar || undefined} />
                      <AvatarFallback>
                        {profile?.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    {!isCollapsed && (
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">
                          {profile?.name || "Setup Profile"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {profile?.profileComplete ? "View Profile" : "Complete Setup"}
                        </span>
                      </div>
                    )}
                  </div>
                </Button>
              </Link>
            )}
            <form action={logout}>
              <Button
                type="submit"
                variant="ghost"
                className="w-full justify-start text-left transition-all duration-200 hover:translate-x-1 hover:bg-destructive/20 hover:text-destructive"
              >
                <LogOut className={`h-4 w-4 ${!isCollapsed && "mr-3"}`} />
                {!isCollapsed && "Logout"}
              </Button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
