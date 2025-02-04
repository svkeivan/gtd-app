"use server";

import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { ironOptions } from "@/lib/config";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { IronSessionData } from "iron-session";

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

// Validation functions
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password: string): { isValid: boolean; message: string } {
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long" };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one lowercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one number" };
  }
  return { isValid: true, message: "" };
}

export async function login(email: string, password: string) {
  try {
    // Validate email
    if (!validateEmail(email)) {
      throw new Error("Please enter a valid email address");
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("The email or password you entered is incorrect");
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password!);

    if (!isValid) {
      throw new Error("The email or password you entered is incorrect");
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
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred. Please try again later.");
  }
}

export async function register(email: string, password: string) {
  try {
    // Validate email
    if (!validateEmail(email)) {
      throw new Error("Please enter a valid email address");
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("An account with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        subscription: {
          create: {
            plan: 'PROFESSIONAL',
            status: 'ACTIVE',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date('2099-12-31'), // Far future date for unlimited access
          }
        }
      }
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

    // Return user data with subscription
    return {
      id: user.id,
      email: user.email,
      subscription: {
        plan: 'PROFESSIONAL',
        status: 'ACTIVE',
        trialEndsAt: null,
        currentPeriodEnd: new Date('2099-12-31'),
        cancelAtPeriodEnd: false
      }
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred. Please try again later.");
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
