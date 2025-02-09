"use client";
import { getProfile, updateProfile } from "@/actions/profile";
import { uploadAvatar } from "@/actions/upload";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { ProfileFormData, profileSchema } from "@/types/profile-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ProfileSetupForm() {
  const { setProfile } = useAppStore();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [originalData, setOriginalData] = useState<ProfileFormData | null>(
    null,
  );

  const form = useForm<ProfileFormData>({
    mode: "onChange", // Enable real-time validation
    resolver: zodResolver(profileSchema),
    defaultValues: {
      language: "en",
      theme: "system",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      workStartTime: "09:00",
      workEndTime: "17:00",
      lunchStartTime: "12:00",
      lunchDuration: 60,
      breakDuration: 15,
      longBreakDuration: 30,
      pomodoroDuration: 25,
      shortBreakInterval: 3,
    },
  });

  // Fetch user profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        const initialData: ProfileFormData = {
          name: data.name || "",
          language: (data.language as ProfileFormData["language"]) || "en",
          theme: (data.theme as ProfileFormData["theme"]) || "system",
          timezone:
            data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          avatar: data.avatar || "",
          workStartTime: data.workStartTime || "09:00",
          workEndTime: data.workEndTime || "17:00",
          lunchStartTime: data.lunchStartTime || "12:00",
          lunchDuration: data.lunchDuration || 60,
          breakDuration: data.breakDuration || 15,
          longBreakDuration: data.longBreakDuration || 30,
          pomodoroDuration: data.pomodoroDuration || 25,
          shortBreakInterval: data.shortBreakInterval || 3,
        };
        setOriginalData(initialData);
        form.reset(initialData);

        // Update progress based on fetched data
        const values = form.getValues();
        const totalFields = Object.keys(profileSchema.shape).length;
        const completedFields = Object.entries(values).filter(
          ([_, value]) => value,
        ).length;
        setProgress((completedFields / totalFields) * 100);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [form]);

  // Calculate form completion progress
  useEffect(() => {
    const values = form.getValues();
    const totalFields = Object.keys(profileSchema.shape).length;
    const completedFields = Object.entries(values).filter(
      ([_, value]) => value,
    ).length;
    setProgress((completedFields / totalFields) * 100);
  }, [form.watch()]);

  const handleCancel = () => {
    if (originalData) {
      form.reset(originalData);
      setError(null);
      setSuccess(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSaving(true);
      setError(null);

      // Optimistically update the form state
      form.reset(data);

      const updatedProfile = await updateProfile(data);
      setProfile(updatedProfile);
      setOriginalData(data);
      setSuccess(true);
      setError(null);
    } catch (err) {
      // Revert to previous state on error
      form.reset(originalData || {});
      setError(err instanceof Error ? err.message : "An error occurred");
      setSuccess(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex min-h-[400px] items-center justify-center p-6">
          <div className="space-y-4 text-center">
            <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError("Only JPEG, PNG and WebP images are allowed");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be less than 5MB");
      return;
    }

    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append("file", file);

      const avatarPath = await uploadAvatar(formData);
      form.setValue("avatar", avatarPath);

      // Save the profile with the new avatar
      const currentFormData = form.getValues();
      const updatedProfile = await updateProfile(currentFormData);
      setProfile(updatedProfile);
      setOriginalData(currentFormData);
      setSuccess(true);
      setError(null);
    } catch (err) {
      console.error("Avatar upload error:", err);
      setError("Failed to upload avatar");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Customize your profile information and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 p-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={form.watch("avatar")} />
            <AvatarFallback className="text-lg">
              {form.watch("name")?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Label htmlFor="avatar">Profile Picture</Label>
            <Input
              id="avatar"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarUpload}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Recommended: Square image, max 5MB (JPEG, PNG, WebP)
            </p>
          </div>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="How should we call you?"
              className="max-w-md"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Preferred Language</Label>
            <Select
              onValueChange={(value) => form.setValue("language", value as any)}
              defaultValue={form.getValues("language")}
            >
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">Display Theme</Label>
            <Select
              onValueChange={(value) => form.setValue("theme", value as any)}
              defaultValue={form.getValues("theme")}
            >
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Your Timezone</Label>
            <Input
              value={form.getValues("timezone")}
              disabled
              className="max-w-md bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              Automatically detected from your browser
            </p>
          </div>

          {/* Work Schedule Section */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-lg font-medium">Work Schedule</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="workStartTime">Work Start Time</Label>
                <Input
                  id="workStartTime"
                  type="time"
                  {...form.register("workStartTime")}
                  className="max-w-md"
                />
                {form.formState.errors.workStartTime && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.workStartTime.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="workEndTime">Work End Time</Label>
                <Input
                  id="workEndTime"
                  type="time"
                  {...form.register("workEndTime")}
                  className="max-w-md"
                />
                {form.formState.errors.workEndTime && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.workEndTime.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lunchStartTime">Lunch Start Time</Label>
                <Input
                  id="lunchStartTime"
                  type="time"
                  {...form.register("lunchStartTime")}
                  className="max-w-md"
                />
                {form.formState.errors.lunchStartTime && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.lunchStartTime.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lunchDuration">Lunch Duration (minutes)</Label>
                <Input
                  id="lunchDuration"
                  type="number"
                  min="15"
                  max="120"
                  {...form.register("lunchDuration", { valueAsNumber: true })}
                  className="max-w-md"
                />
                {form.formState.errors.lunchDuration && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.lunchDuration.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Break Preferences Section */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-lg font-medium">Break Preferences</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="breakDuration">
                  Short Break Duration (minutes)
                </Label>
                <Input
                  id="breakDuration"
                  type="number"
                  min="5"
                  max="30"
                  {...form.register("breakDuration", { valueAsNumber: true })}
                  className="max-w-md"
                />
                {form.formState.errors.breakDuration && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.breakDuration.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="longBreakDuration">
                  Long Break Duration (minutes)
                </Label>
                <Input
                  id="longBreakDuration"
                  type="number"
                  min="15"
                  max="60"
                  {...form.register("longBreakDuration", {
                    valueAsNumber: true,
                  })}
                  className="max-w-md"
                />
                {form.formState.errors.longBreakDuration && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.longBreakDuration.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="pomodoroDuration">
                  Focus Session Duration (minutes)
                </Label>
                <Input
                  id="pomodoroDuration"
                  type="number"
                  min="15"
                  max="60"
                  {...form.register("pomodoroDuration", {
                    valueAsNumber: true,
                  })}
                  className="max-w-md"
                />
                {form.formState.errors.pomodoroDuration && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.pomodoroDuration.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortBreakInterval">
                  Sessions Before Long Break
                </Label>
                <Input
                  id="shortBreakInterval"
                  type="number"
                  min="1"
                  max="6"
                  {...form.register("shortBreakInterval", {
                    valueAsNumber: true,
                  })}
                  className="max-w-md"
                />
                {form.formState.errors.shortBreakInterval && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.shortBreakInterval.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Profile Completion</Label>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground">
              {Math.round(progress)}% complete
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50">
              <AlertDescription>Profile updated successfully!</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              className="min-w-[120px]"
              disabled={
                !form.formState.isDirty || !form.formState.isValid || isSaving
              }
            >
              {isSaving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
