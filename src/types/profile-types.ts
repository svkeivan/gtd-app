import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  language: z.enum(["en", "es", "fr", "de"]),
  theme: z.enum(["light", "dark", "system"]),
  timezone: z.string(),
  avatar: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
