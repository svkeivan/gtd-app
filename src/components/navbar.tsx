"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

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
    <nav className='bg-gray-800 text-white p-4'>
      <div className='container mx-auto flex justify-between items-center'>
        <Link
          href='/'
          className='text-xl font-bold'
        >
          GTD App
        </Link>
        <div className='space-x-4'>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              passHref
            >
              <Button
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={pathname === item.href ? "bg-gray-700" : ""}
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
