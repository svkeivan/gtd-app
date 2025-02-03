"use server";

import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { ironOptions } from "@/lib/config";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { IronSessionData } from "iron-session";
import { SubscriptionService } from "@/lib/subscription";

const prisma = new PrismaClient();

declare module "iron-session" {
  interface IronSessionData {
    user?: {
      id: string;
      email: string;
      isLoggedIn: boolean;
    };
  }
}

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
    const cookieStore = await cookies();
    const session = await getIronSession<IronSessionData>(cookieStore, ironOptions);

    // Set session data
    session.user = {
      id: user.id,
      email: user.email,
      isLoggedIn: true,
    };

    // Save session
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

    // Create new user with transaction to ensure both user and subscription are created
    const { user, subscription } = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      // Create trial subscription
      const newSubscription = await SubscriptionService.createTrialSubscription(newUser.id);

      return { 
        user: newUser, 
        subscription: newSubscription 
      };
    });

    // Create session
    const cookieStore = await cookies();
    const session = await getIronSession<IronSessionData>(cookieStore, ironOptions);

    // Set session data
    session.user = {
      id: user.id,
      email: user.email,
      isLoggedIn: true,
    };

    // Save session
    await session.save();

    return {
      id: user.id,
      email: user.email,
      subscription: subscription ? {
        plan: subscription.plan,
        trialEndsAt: subscription.trialEndsAt,
      } : null,
    };
  } catch (error) {
    throw error;
  }
}

export async function logout() {
  const cookieStore = await cookies();
  const session = await getIronSession<IronSessionData>(cookieStore, ironOptions);
  session.destroy();
  redirect("/login");
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<IronSessionData>(cookieStore, ironOptions);
  return session.user;
}

export async function validateSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<IronSessionData>(cookieStore, ironOptions);
  
  if (!session.user?.isLoggedIn) {
    redirect("/login");
  }
  
  return session.user;
}
