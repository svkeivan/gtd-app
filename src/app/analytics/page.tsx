import { getAnalyticsData } from "../../actions/analytics";
import { AnalyticsView } from "./analytics-view";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AnalyticsPage() {
  const { user } = await auth();

  if (!user || !user.isLoggedIn) {
    redirect("/login");
  }

  const analyticsData = await getAnalyticsData(user.id);

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Analytics</h1>
      <AnalyticsView data={analyticsData} />
    </div>
  );
}
