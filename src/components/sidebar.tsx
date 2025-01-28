"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/dashboard/inbox", label: "Inbox", icon: "📥" },
    { href: "/dashboard/process", label: "Process", icon: "⚡" },
    { href: "/dashboard/next-actions", label: "Next Actions", icon: "✅" },
    { href: "/dashboard/projects", label: "Projects", icon: "📁" },
    { href: "/dashboard/contexts", label: "Contexts", icon: "🔍" },
    { href: "/dashboard/tags", label: "Tags", icon: "🏷️" },
    { href: "/dashboard/calendar", label: "Calendar", icon: "📅" },
    { href: "/dashboard/analytics", label: "Analytics", icon: "📈" },
    { href: "/dashboard/review", label: "Review", icon: "🔄" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-800 p-4 text-white">
      <div className="flex h-full flex-col">
        <Link
          href="/"
          className="mb-8 flex items-center gap-2 text-xl font-bold"
        >
          <span>GTD App</span>
        </Link>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="block">
              <Button
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={`w-full justify-start text-left ${
                  pathname === item.href ? "bg-gray-700" : ""
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-700 pt-4">
          <Link href="/api/auth/logout">
            <Button variant="ghost" className="w-full justify-start">
              <span className="mr-2">🚪</span>
              Logout
            </Button>
          </Link>
        </div>
      </div>
    </aside>
  );
}
