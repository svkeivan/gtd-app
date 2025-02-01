"use server";

import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { ironOptions } from "@/lib/config";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { IronSessionData } from "iron-session";

const prisma = new PrismaClient();

export async function login(email: string, password: string) {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password!);

    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    // Create session
    const session = await getIronSession<IronSessionData>(await cookies(), ironOptions);

    session.user = {
      id: user.id,
      email: user.email,
      isLoggedIn: true,
    };
    await session.save();

    return {
      id: user.id,
      email: user.email,
    };
  } catch (error) {
    throw error;
  }
}

export async function register(email: string, password: string) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // Create session
    const session = await getIronSession<IronSessionData>(await cookies(), ironOptions);

    session.user = {
      id: user.id,
      email: user.email,
      isLoggedIn: true,
    };
    await session.save();

    return {
      id: user.id,
      email: user.email,
    };
  } catch (error) {
    throw error;
  }
}

export async function logout() {
  const cookieStore = await cookies();
  const session = await getIronSession(cookieStore, ironOptions);
  session.destroy();
  redirect("/login");
}
