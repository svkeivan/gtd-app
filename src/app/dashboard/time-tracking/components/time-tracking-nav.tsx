"use client"
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, BarChart2, Timer } from "lucide-react";

const navItems = [
  {
    title: "Overview",
    href: "/dashboard/time-tracking",
    icon: Clock
  },
  {
    title: "Analytics",
    href: "/dashboard/time-tracking/analytics",
    icon: BarChart2
  },
  {
    title: "Focus Timer",
    href: "/dashboard/time-tracking/focus",
    icon: Timer
  }
];

export function TimeTrackingNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 mb-8">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
              isActive
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}