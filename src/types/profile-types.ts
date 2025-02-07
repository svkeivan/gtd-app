import { z } from "zod";

export const subscriptionSchema = z.object({
  plan: z.enum(["FREE", "PERSONAL", "PROFESSIONAL", "ENTERPRISE"]),
  status: z.enum(["TRIALING", "ACTIVE", "CANCELED", "PAST_DUE", "UNPAID"]),
  trialEndsAt: z.date().nullable(),
  currentPeriodEnd: z.date(),
  cancelAtPeriodEnd: z.boolean(),
  features: z.object({
    projects: z.string(),
    analytics: z.string(),
    support: z.string(),
    teamFeatures: z.string()
  }).optional()
});

// Time validation regex for 24h format (00:00 to 23:59)
const timeRegex = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  language: z.enum(["en", "es", "fr", "de"]),
  theme: z.enum(["light", "dark", "system"]),
  timezone: z.string(),
  avatar: z.string().optional(),
  // Work schedule preferences
  workStartTime: z.string().regex(timeRegex, "Invalid time format. Use HH:mm (24h format)"),
  workEndTime: z.string().regex(timeRegex, "Invalid time format. Use HH:mm (24h format)"),
  lunchStartTime: z.string().regex(timeRegex, "Invalid time format. Use HH:mm (24h format)"),
  lunchDuration: z.number().min(15, "Minimum lunch duration is 15 minutes").max(120, "Maximum lunch duration is 120 minutes"),
  breakDuration: z.number().min(5, "Minimum break duration is 5 minutes").max(30, "Maximum break duration is 30 minutes"),
  longBreakDuration: z.number().min(15, "Minimum long break duration is 15 minutes").max(60, "Maximum long break duration is 60 minutes"),
  pomodoroDuration: z.number().min(15, "Minimum pomodoro duration is 15 minutes").max(60, "Maximum pomodoro duration is 60 minutes"),
  shortBreakInterval: z.number().min(1, "Minimum interval is 1").max(6, "Maximum interval is 6"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type SubscriptionData = z.infer<typeof subscriptionSchema>;
