"use server";

import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { ironOptions } from "@/lib/config";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { IronSessionData } from "iron-session";
import { createSafeAction } from "@/lib/safe-action";
import {
  ValidationError,
  AuthenticationError,
  handlePrismaError,
} from "@/lib/errors";

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

// Implementation functions
async function loginImpl(email: string, password: string) {
  // Validate email
  if (!validateEmail(email)) {
    throw new ValidationError("Please enter a valid email address");
  }

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Use generic message for security
      throw new AuthenticationError("Invalid credentials");
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password!);

    if (!isValid) {
      // Use generic message for security
      throw new AuthenticationError("Invalid credentials");
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
    if (error instanceof AuthenticationError || error instanceof ValidationError) {
      throw error;
    }
    handlePrismaError(error);
  }
}

async function registerImpl(email: string, password: string) {
  // Validate email
  if (!validateEmail(email)) {
    throw new ValidationError("Please enter a valid email address");
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    throw new ValidationError(passwordValidation.message);
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ValidationError("An account with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with subscription
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
    if (error instanceof ValidationError) {
      throw error;
    }
    handlePrismaError(error);
  }
}

async function logoutImpl() {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<IronSessionData>(cookieStore, ironOptions);
    await session.destroy();
    redirect("/login");
  } catch (error) {
    throw new Error("Failed to logout. Please try again.");
  }
}

async function getSessionImpl() {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<IronSessionData>(cookieStore, ironOptions);
    return session.user;
  } catch (error) {
    throw new Error("Failed to get session. Please try again.");
  }
}

async function validateSessionImpl() {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<IronSessionData>(cookieStore, ironOptions);
    
    if (!session.user?.isLoggedIn) {
      throw new AuthenticationError("Session expired");
    }
    
    return session.user;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      redirect("/login");
    }
    throw new Error("Failed to validate session. Please try again.");
  }
}

// Export wrapped actions
export const login = createSafeAction(loginImpl, false); // false = don't require auth
export const register = createSafeAction(registerImpl, false);
export const logout = createSafeAction(logoutImpl);
export const getSession = createSafeAction(getSessionImpl, false);
export const validateSession = createSafeAction(validateSessionImpl, false);
