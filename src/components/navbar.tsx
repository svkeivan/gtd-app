"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/inbox", label: "Inbox" },
    { href: "/process", label: "Process" },
    { href: "/next-actions", label: "Next Actions" },
    { href: "/projects", label: "Projects" },
    { href: "/contexts", label: "Contexts" },
    { href: "/tags", label: "Tags" },
    { href: "/calendar", label: "Calendar" },
    { href: "/analytics", label: "Analytics" },
    { href: "/review", label: "Review" },
  ];

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link
          href="/"
          className="text-xl font-bold"
        >
          Planito
        </Link>
        <div className="ml-auto flex items-center space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              passHref
            >
              <Button
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={pathname === item.href ? "bg-muted" : ""}
              >
                {item.label}
              </Button>
            </Link>
          ))}
          <ThemeSwitcher />
        </div>
      </div>
    </nav>
  );
}
