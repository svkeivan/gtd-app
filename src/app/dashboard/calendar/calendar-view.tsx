"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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

  useEffect(() => {
    // Fetch available tasks when dialog opens
    if (selectedSlot) {
      fetch("/api/items?status=NEXT")
        .then((res) => res.json())
        .then((data) => setTasks(data))
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
      const response = await fetch(`/api/items/${event.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plannedDate: start,
          estimated: duration,
        }),
      });

      if (!response.ok) throw new Error("Failed to update task");

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
      const response = await fetch(`/api/items/${event.itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plannedDate: start,
          estimated: moment(end).diff(moment(start), "minutes"),
        }),
      });

      if (!response.ok) throw new Error("Failed to update task");

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
      const response = await fetch(`/api/items/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plannedDate: selectedSlot.start,
          estimated: duration,
        }),
      });

      if (!response.ok) throw new Error("Failed to update task");

      const updatedTask = await response.json();
      const newEvent: CalendarEvent = {
        id: updatedTask.id,
        title: updatedTask.title,
        start: new Date(updatedTask.plannedDate),
        end: moment(updatedTask.plannedDate)
          .add(updatedTask.estimated, "minutes")
          .toDate(),
        isTask: true,
        itemId: updatedTask.id,
        estimated: updatedTask.estimated,
      };

      setEvents([...events, newEvent]);
      setSelectedSlot(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  return (
    <div className="space-y-4">
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
