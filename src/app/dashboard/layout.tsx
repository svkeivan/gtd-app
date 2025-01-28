import { Sidebar } from "@/components/sidebar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await auth();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
