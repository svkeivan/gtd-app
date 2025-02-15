"use server";

import { getUncompletedTasks } from "@/actions/tasks";

/**
 * Retrieves tasks with "NEXT_ACTION" status for a given user.
 */
export async function getNextActionTasks(userId: string): Promise<any[]> {
  return await getUncompletedTasks(userId);
}
