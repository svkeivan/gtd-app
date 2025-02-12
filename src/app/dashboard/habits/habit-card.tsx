"use client";

import { Habit } from "@/types/habit-types";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface HabitCardProps {
  habit: Habit;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{habit.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{habit.description}</p>
        <p>Frequency: {habit.frequency} per {habit.period}</p>
      </CardContent>
    </Card>
  );
};
