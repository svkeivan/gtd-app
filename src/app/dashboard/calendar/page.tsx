import { getCalendarEvents } from "@/actions/calendar";
import { getUncompletedTasks } from "@/actions/tasks";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CalendarView } from "./calendar-view";
import { UncompletedTasks } from "./uncompleted-tasks";

export default async function CalendarPage() {
  const { user } = await auth();

  if (!user || !user.isLoggedIn) {
    redirect("/login");
  }

  const [events, tasks] = await Promise.all([
    getCalendarEvents(user.id),
    getUncompletedTasks(user.id),
  ]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Calendar</h1>
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1">
          <UncompletedTasks tasks={tasks} />
        </div>
        <div className="col-span-3">
          <CalendarView initialEvents={events} />
        </div>
      </div>
    </div>
  );
}
