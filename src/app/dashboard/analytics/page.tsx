import { getAnalyticsData } from "@/actions/analytics";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AnalyticsView } from "./analytics-view";

export default async function AnalyticsPage() {
  const { user } = await auth();

  if (!user || !user.isLoggedIn) {
    redirect("/login");
  }

  const analyticsData = await getAnalyticsData(user.id);

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Analytics</h1>
      <AnalyticsView data={analyticsData} />
    </div>
  );
}
