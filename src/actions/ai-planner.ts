"use server";

import { getContexts } from "@/actions/contexts";
import { getProfile } from "@/actions/profile";
import { Context, ItemStatus, PriorityLevel, Project } from "@prisma/client";
import { getNextActions } from "./items";

/**
 * Constructs the prompt for the weekly plan by gathering tasks, profile, and context data.
 */
export async function buildWeeklyPlanPrompt(): Promise<string> {
  const tasksData = await getNextActions();
  const profileData = await getProfile();
  const rawContextData = await getContexts();
  const contextData = Array.isArray(rawContextData) ? rawContextData : [];
  const tasks = tasksData
    .map(
      (task: {
        id: string;
        title: string;
        status: ItemStatus;
        project: Project | null;
        priority: PriorityLevel | null;
        contexts: Context[];
        dueDate: Date | null;
        estimated: number | null;
      }) =>
        `${task.title}: ID ${task.id}, Status ${task.status}${task.priority ? `, Priority ${task.priority}` : ""}${task.estimated ? `, Estimated ${task.estimated}` : ""}${task.project ? `, Project ${task.project.title}` : ""}${task.contexts.length > 0 ? `, Context ${task.contexts[0].name}` : ""}${task.dueDate ? `, Due ${task.dueDate.toISOString().split("T")[0]}` : ""}`,
    )
    .join("; ");
  const profile = `Work starts at ${profileData.workStartTime} and ends at ${profileData.workEndTime}. Lunch starts at ${profileData.lunchStartTime} for ${profileData.lunchDuration} minutes. Short breaks are ${profileData.breakDuration} minutes every ${profileData.pomodoroDuration} minutes of work, with a longer ${profileData.longBreakDuration} minute break after ${profileData.shortBreakInterval} short breaks.`;
  const contextItems = contextData
    .map(
      (ctx) =>
        `${ctx.name} (${ctx.mondayEnabled ? "Mon " : ""}${ctx.tuesdayEnabled ? "Tue " : ""}${ctx.wednesdayEnabled ? "Wed " : ""}${ctx.thursdayEnabled ? "Thu " : ""}${ctx.fridayEnabled ? "Fri " : ""}${ctx.saturdayEnabled ? "Sat " : ""}${ctx.sundayEnabled ? "Sun " : ""}) from ${ctx.startTime} to ${ctx.endTime}`,
    )
    .join("; ");
  return `You are an AI scheduling assistant. Based on the following data:
Tasks: ${tasks}
Profile: ${profile}
Context: ${contextItems}
Generate a detailed weekly plan for the user.`;
}
/**
 * Generates the weekly plan by sending the provided (or constructed) prompt to OpenRouter's API.
 * @param providedPrompt Optional prompt string. If not provided, the prompt is constructed internally.
 */
export async function generateWeeklyPlan(
  providedPrompt: string,
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set in environment variables.");
  }

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: providedPrompt,
                },
              ],
            },
          ],
          max_tokens: 5000,
          temperature: 0.7,
        }),
      },
    );
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `OpenRouter API error: ${response.status} ${response.statusText}. Body: ${errorBody}`,
      );
    }
    const data = await response.json();
    if (
      data &&
      data.choices &&
      data.choices.length > 0 &&
      data.choices[0].message &&
      data.choices[0].message.content
    ) {
      const planText = data.choices[0].message.content;
      return planText;
    } else {
      throw new Error("No completion message returned from OpenRouter.");
    }
  } catch (error: any) {
    console.error("Error calling OpenRouter:", error);
    // Fallback plan in case of error
    return `Fallback Weekly Plan:
Monday: Review tasks and set priorities.
Tuesday: Dedicated work on high priority tasks.
Wednesday: Attend team meetings and follow up.
Thursday: Work on medium priority tasks and project planning.
Friday: Wrap up tasks and prepare for next week.`;
  }
}
