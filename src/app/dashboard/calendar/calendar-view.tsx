"use client";

import { getNextItems, updateItemPlanning } from "@/actions/items";
import { scheduleUnplannedTasks } from "@/actions/schedule";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";
import {
  Calendar,
  DateLocalizer,
  momentLocalizer,
  SlotInfo,
} from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

type DragAndDropCalendarProps = {
  localizer: DateLocalizer;
  events: CalendarEvent[];
  startAccessor: string | ((event: CalendarEvent) => Date);
  endAccessor: string | ((event: CalendarEvent) => Date);
  style: React.CSSProperties;
  onEventDrop: (args: { event: CalendarEvent; start: Date; end: Date }) => void;
  onEventResize: (args: {
    event: CalendarEvent;
    start: Date;
    end: Date;
  }) => void;
  eventPropGetter: (event: CalendarEvent) => { className: string };
  resizable?: boolean;
  selectable?: boolean;
  views: string[];
  onSelectSlot: (slotInfo: SlotInfo) => void;
  defaultView?: string;
  components?: {
    event: React.ComponentType<{ event: CalendarEvent }>;
  };
};

const DnDCalendar = withDragAndDrop(
  Calendar,
) as React.ComponentType<DragAndDropCalendarProps>;

moment.locale("en-GB");
const localizer = momentLocalizer(moment);

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  isTask?: boolean;
  isTimeEntry?: boolean;
  itemId?: string;
  estimated?: number;
  draggedFromOutside?: boolean;
  dataTransfer?: DataTransfer;
}

interface Task {
  id: string;
  title: string;
  status: string;
}

interface CalendarViewProps {
  initialEvents: CalendarEvent[];
}

export function CalendarView({ initialEvents }: CalendarViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isScheduling, setIsScheduling] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch available tasks when dialog opens
    if (selectedSlot) {
      getNextItems()
        .then(setTasks)
        .catch((error) => console.error("Error fetching tasks:", error));
    }
  }, [selectedSlot]);

  const eventPropGetter = (event: CalendarEvent) => ({
    className: `${event.isTask ? "bg-blue-500" : ""} ${event.isTimeEntry ? "bg-green-500" : ""}`,
  });

  const onEventDrop = async ({
    event,
    start,
  }: {
    event: CalendarEvent & { draggedFromOutside?: boolean };
    start: Date;
    end: Date;
  }) => {
    if (!event.isTask) return;

    const duration = event.draggedFromOutside
      ? event.estimated || 30 // Default to 30 minutes for new drops
      : moment(event.end).diff(moment(event.start), "minutes"); // Keep existing duration for moves

    const endTime = moment(start).add(duration, "minutes").toDate();

    try {
      await updateItemPlanning(event.id, {
        plannedDate: start,
        estimated: duration,
      });

      const newEvent: CalendarEvent = {
        id: event.id,
        title: event.title,
        start: new Date(start),
        end: endTime,
        isTask: true,
        itemId: event.id,
        estimated: duration,
      };

      if (event.draggedFromOutside) {
        setEvents([...events, newEvent]);
      } else {
        setEvents(events.map((e) => (e.id === event.id ? newEvent : e)));
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const onEventResize = async ({
    event,
    start,
    end,
  }: {
    event: CalendarEvent;
    start: Date;
    end: Date;
  }) => {
    if (!event.isTask) return;

    try {
      await updateItemPlanning(event.itemId!, {
        plannedDate: start,
        estimated: moment(end).diff(moment(start), "minutes"),
      });

      const updatedEvent = {
        ...event,
        start: new Date(start),
        end: new Date(end),
      };
      setEvents(events.map((e) => (e.id === event.id ? updatedEvent : e)));
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setSelectedSlot(slotInfo);
  };

  const handleTaskSelect = async (task: Task) => {
    if (!selectedSlot) return;

    const duration = moment(selectedSlot.end).diff(
      moment(selectedSlot.start),
      "minutes",
    );

    try {
      const updatedTask = await updateItemPlanning(task.id, {
        plannedDate: selectedSlot.start,
        estimated: duration,
      });

      const newEvent: CalendarEvent = {
        id: task.id,
        title: task.title,
        start: new Date(selectedSlot.start),
        end: moment(selectedSlot.start).add(duration, "minutes").toDate(),
        isTask: true,
        itemId: task.id,
        estimated: duration,
      };

      setEvents([...events, newEvent]);
      setSelectedSlot(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };
  const handleSmartSchedule = async () => {
    if (isScheduling) return;

    setIsScheduling(true);
    try {
      const today = new Date();
      const scheduledTasks = await scheduleUnplannedTasks(
        // Since this is client component, we'll get userId from the URL or context
        window.location.pathname.split("/")[2],
        today,
      );

      // Add newly scheduled tasks to calendar
      const newEvents = scheduledTasks.map(
        (task): CalendarEvent => ({
          id: task.taskId,
          title:
            tasks.find((t) => t.id === task.taskId)?.title || "Scheduled Task",
          start: task.plannedDate,
          end: new Date(task.plannedDate.getTime() + task.estimated * 60000),
          isTask: true,
          itemId: task.taskId,
          estimated: task.estimated,
        }),
      );

      setEvents([...events, ...newEvents]);

      toast({
        title: "Tasks Scheduled",
        description: `Successfully scheduled ${scheduledTasks.length} tasks`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error in smart scheduling:", error);
      toast({
        title: "Scheduling Failed",
        description: "There was an error scheduling your tasks",
        variant: "destructive",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={handleSmartSchedule}
          className="bg-green-500 text-white hover:bg-green-600"
          disabled={isScheduling}
        >
          {isScheduling ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scheduling...
            </>
          ) : (
            "Smart Schedule Tasks"
          )}
        </Button>
      </div>
      <Dialog open={!!selectedSlot} onOpenChange={() => setSelectedSlot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Task to Calendar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Select a task to schedule for{" "}
              {selectedSlot?.start.toLocaleString()}
            </p>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {tasks.map((task) => (
                  <Button
                    key={task.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleTaskSelect(task)}
                  >
                    {task.title}
                  </Button>
                ))}
              </div>
            </ScrollArea>
            <Button onClick={() => setSelectedSlot(null)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
      <div className="h-[600px] rounded-lg bg-white shadow">
        <DnDCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          onEventDrop={onEventDrop}
          onEventResize={onEventResize}
          eventPropGetter={eventPropGetter}
          resizable
          selectable
          views={["month", "week", "day"]}
          onSelectSlot={handleSelectSlot}
          defaultView="week"
          components={{
            event: ({ event }) => (
              <div
                className={`${event.isTask ? "bg-blue-500" : ""} ${event.isTimeEntry ? "bg-green-500" : ""} rounded p-1 text-sm text-white`}
              >
                {event.title}
              </div>
            ),
          }}
        />
      </div>
    </div>
  );
}
