import { z } from "zod";

export const subscriptionSchema = z.object({
  plan: z.enum(["FREE", "PERSONAL", "PROFESSIONAL", "ENTERPRISE"]),
  status: z.enum(["TRIALING", "ACTIVE", "CANCELED", "PAST_DUE", "UNPAID"]),
  trialEndsAt: z.date().nullable(),
  currentPeriodEnd: z.date(),
  cancelAtPeriodEnd: z.boolean(),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  language: z.enum(["en", "es", "fr", "de"]),
  theme: z.enum(["light", "dark", "system"]),
  timezone: z.string(),
  avatar: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type SubscriptionData = z.infer<typeof subscriptionSchema>;
