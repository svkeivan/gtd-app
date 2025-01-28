import { getCalendarEvents } from "@/actions/calendar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CalendarView } from "./calendar-view";

export default async function CalendarPage() {
  const { user } = await auth();

  if (!user || !user.isLoggedIn) {
    redirect("/login");
  }

  const events = await getCalendarEvents(user.id);

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Calendar</h1>
      <CalendarView initialEvents={events} userId={user.id} />
    </div>
  );
}
