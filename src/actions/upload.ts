"use server";

import { auth } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function uploadAvatar(formData: FormData) {
  const { user: authUser } = await auth();

  if (!authUser?.id) {
    throw new Error("Unauthorized");
  }

  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file provided");
  }

  // Create profile images directory if it doesn't exist
  const uploadDir = join(process.cwd(), "public", "images", "profile");
  try {
    await writeFile(join(uploadDir, ".keep"), ""); // Ensure directory exists
  } catch (error) {
    // Directory already exists, continue
  }

  // Generate unique filename using timestamp and user ID
  const timestamp = Date.now();
  const extension = file.name.split(".").pop();
  const filename = `${authUser.id}-${timestamp}.${extension}`;
  
  // Convert file to buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Save file
  const filepath = join(uploadDir, filename);
  await writeFile(filepath, buffer);

  // Return the public URL
  return `/images/profile/${filename}`;
}