"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();

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
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-800 p-4 text-white shadow-lg transition-all duration-300 ease-in-out">
      <div className="flex h-full flex-col">
        <Link
          href="/"
          className="group mb-8 flex items-center gap-2 text-xl font-bold transition-transform duration-200 hover:scale-105"
        >
          <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            GTD App
          </span>
        </Link>

        <nav className="flex-1 space-y-4">
          {Object.entries(categories).map(([category, title]) => (
            <div key={category} className="space-y-1.5">
              <div className="px-2 text-sm font-semibold text-gray-400">
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
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 font-medium shadow-md"
                          : "hover:bg-gray-700/50"
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

        <div className="border-t border-gray-700 pt-4">
          <Link href="/api/auth/logout">
            <Button
              variant="ghost"
              className="w-full justify-start transition-colors duration-200 hover:bg-red-500/20 hover:text-red-400"
            >
              <span className="mr-3">🚪</span>
              Logout
            </Button>
          </Link>
        </div>
      </div>
    </aside>
  );
}
