import { getCalendarEvents } from "../../actions/calendar";
import { CalendarView } from "./calendar-view";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CalendarPage() {
  const { user } = await auth();

  if (!user || !user.isLoggedIn) {
    redirect("/login");
  }

  const events = await getCalendarEvents(user.id);

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Calendar</h1>
      <CalendarView
        initialEvents={events}
        userId={user.id}
      />
    </div>
  );
}
