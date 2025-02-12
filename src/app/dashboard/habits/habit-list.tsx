"use client";

import { useEffect, useState } from "react";
import { HabitCard } from "@/app/dashboard/habits/habit-card";
import { Habit } from "@/types/habit-types";
import { HabitForm } from "@/app/dashboard/habits/habit-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const HabitList = () => {
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    // Fetch habits from API
    const fetchHabits = async () => {
      const response = await fetch("/api/habits");
      const data = await response.json();
      setHabits(data);
    };

    fetchHabits();
  }, []);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Habit Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <HabitForm />
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
