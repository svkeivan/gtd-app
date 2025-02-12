# Habit Tracker Implementation Plan

## Overview

This document outlines the plan to add a habit tracker and a recording feature to the GTD App. The habit tracker will allow users to track their daily habits and monitor their progress. The recording feature will allow users to record specific events or metrics, such as wake-up time or medication intake.

## Data Model Changes

The following changes will be made to the database schema:

*   **Habit Model:**
    *   `id` (String, @id, @default(cuid()))
    *   `name` (String)
    *   `description` (String?)
    *   `frequency` (Int, @default(1)) - How many times per day/week/month
    *   `period` (string, @default("day")) - day, week, month
    *   `user` (User, @relation)
    *   `userId` (String)
    *   `logs` (HabitLog\[])
    *   `createdAt` (DateTime, @default(now()))
    *   `updatedAt` (DateTime, @updatedAt)
*   **HabitLog Model:**
    *   `id` (String, @id, @default(cuid()))
    *   `habit` (Habit, @relation)
    *   `habitId` (String)
    *   `date` (DateTime, @default(now()), @db.Date) - Only date part
    *   `completed` (Boolean, @default(false))
    *   `createdAt` (DateTime, @default(now()))
    *   `updatedAt` (DateTime, @updatedAt)
    *   `@@unique([habitId, date])`
*   **DailyProductivity Model:**
    *   `id` (String, @id, @default(cuid()))
    *   `date` (DateTime)
    *   `user` (User, @relation)
    *   `userId` (String)
    *   `focusSessionsCount` (Int, @default(0))
    *   `focusMinutes` (Int, @default(0))
    *   `completedTasks` (Int, @default(0))
    *   `breakAdherence` (Float, @default(0))
    *   `productivity` (Float, @default(0))
    *   `metrics` (DailyMetric[])
    *   `createdAt` (DateTime, @default(now()))
    *   `updatedAt` (DateTime, @updatedAt)
*   **DailyMetric Model:**
    *   `id` (String, @id, @default(cuid()))
    *   `name` (String)
    *   `value` (String?) - Store value as string to accommodate different data types
    *   `dailyProductivity` (DailyProductivity, @relation)
    *   `dailyProductivityId` (String)
    *   `createdAt` (DateTime, @default(now()))
    *   `updatedAt` (DateTime, @updatedAt)

## UI Design and Placement

The habit tracker will be integrated into the dashboard. A new section will be added to display the user's habits and their completion status. Users will be able to:

*   Add new habits
*   Edit existing habits
*   Mark habits as complete for the day

The recording feature will be implemented as a form in the dashboard. Users will be able to:

*   Add custom metrics to record
*   Record values for each custom metric

## Implementation Plan

1.  **Database Schema Changes:**
    *   Modify the `prisma/schema.prisma` file to include the new models and fields.
    *   Run `pnpx prisma generate` to generate the Prisma client.
    *   Run `pnpx prisma db push` to update the database schema.
2.  **Backend Implementation:**
    *   Create new API endpoints to:
        *   Create, read, update, and delete habits.
        *   Record habit completion status.
        *   Record daily metrics.
    *   Implement the logic to:
        *   Calculate habit completion streaks.
        *   Generate habit tracking reports.
3.  **Frontend Implementation:**
    *   Create new UI components for:
        *   Habit list
        *   Habit card
        *   Habit form
        *   Recording form
    *   Integrate the new components into the dashboard.
4.  **Testing:**
    *   Test the new features thoroughly to ensure they work as expected.
    *   Fix any bugs or issues that are found.

## Next Steps

1.  Get user approval on this implementation plan.
2.  Implement the database schema changes.
3.  Implement the backend logic.
4.  Implement the frontend UI.
5.  Test the new features.
