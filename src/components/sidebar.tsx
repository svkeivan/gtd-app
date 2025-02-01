"use client";

import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface Profile {
  name: string;
  avatar?: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const navItems = [
    // Task Workflow
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: "📊",
      category: "overview",
    },
    {
      href: "/dashboard/inbox",
      label: "Inbox",
      icon: "📥",
      category: "workflow",
    },
    {
      href: "/dashboard/next-actions",
      label: "Next Actions",
      icon: "✅",
      category: "workflow",
    },
    {
      href: "/dashboard/review",
      label: "Review",
      icon: "🔄",
      category: "workflow",
    },

    // Basic Data
    {
      href: "/dashboard/projects",
      label: "Projects",
      icon: "📁",
      category: "data",
    },
    {
      href: "/dashboard/contexts",
      label: "Contexts",
      icon: "🔍",
      category: "data",
    },
    { href: "/dashboard/tags", label: "Tags", icon: "🏷️", category: "data" },

    // Tools & Analysis
    {
      href: "/dashboard/calendar",
      label: "Calendar",
      icon: "📅",
      category: "tools",
    },
    {
      href: "/dashboard/analytics",
      label: "Analytics",
      icon: "📈",
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
    <aside className="fixed left-0 top-0 h-screen w-64 border-r bg-background p-4 text-foreground shadow-lg transition-all duration-300 ease-in-out">
      <div className="flex h-full flex-col">
        <div className="mb-8 flex w-full items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 text-xl font-bold transition-transform duration-200 hover:scale-105"
          >
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              GTD App
            </span>
          </Link>
          <ThemeSwitcher />
        </div>

        <nav className="flex-1 space-y-4">
          {Object.entries(categories).map(([category, title]) => (
            <div key={category} className="space-y-1.5">
              <div className="px-2 text-sm font-semibold text-muted-foreground">
                {title}
              </div>
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
                      }`}
                    >
                      <span className="mr-3 transform transition-transform duration-200 group-hover:scale-110">
                        {item.icon}
                      </span>
                      {item.label}
                    </Button>
                  </Link>
                ))}
            </div>
          ))}
        </nav>

        <div className="space-y-4 border-t border-border pt-4">
          <Link href="/dashboard/profile">
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-accent"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar} />
                  <AvatarFallback>{profile?.name?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{profile?.name || 'Setup Profile'}</span>
                  <span className="text-xs text-muted-foreground">View Profile</span>
                </div>
              </div>
            </Button>
          </Link>
          <Link href="/api/auth/logout">
            <Button
              variant="ghost"
              className="w-full justify-start text-left transition-all duration-200 hover:translate-x-1 hover:bg-destructive/20 hover:text-destructive"
            >
              <span className="mr-3 transform transition-transform duration-200 group-hover:scale-110">🚪</span>
              Logout
            </Button>
          </Link>
        </div>      </div>
    </aside>
  );
}
