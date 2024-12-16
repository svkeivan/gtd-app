'use client'

import { useState } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useAppStore } from '@/lib/store'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

moment.locale('en-GB')
const localizer = momentLocalizer(moment)

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay?: boolean
}

interface CalendarViewProps {
  initialEvents: CalendarEvent[]
  userId: string
}

export function CalendarView({ initialEvents, userId }: CalendarViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventStart, setNewEventStart] = useState('')
  const [newEventEnd, setNewEventEnd] = useState('')

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEventTitle || !newEventStart || !newEventEnd) return

    const newEvent = {
      title: newEventTitle,
      start: new Date(newEventStart),
      end: new Date(newEventEnd),
    }

    try {
      const response = await fetch('/api/calendar-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...newEvent, userId }),
      })

      if (!response.ok) {
        throw new Error('Failed to add event')
      }

      const savedEvent = await response.json()
      setEvents([...events, savedEvent])
      setNewEventTitle('')
      setNewEventStart('')
      setNewEventEnd('')
    } catch (error) {
      console.error('Error adding event:', error)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <form onSubmit={addEvent} className="space-y-4">
            <div>
              <Label htmlFor="event-title">Event Title</Label>
              <Input
                id="event-title"
                type="text"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="event-start">Start Time</Label>
              <Input
                id="event-start"
                type="datetime-local"
                value={newEventStart}
                onChange={(e) => setNewEventStart(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="event-end">End Time</Label>
              <Input
                id="event-end"
                type="datetime-local"
                value={newEventEnd}
                onChange={(e) => setNewEventEnd(e.target.value)}
                required
              />
            </div>
            <Button type="submit">Add Event</Button>
          </form>
        </CardContent>
      </Card>
      <div className="h-[600px]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
        />
      </div>
    </div>
  )
}

