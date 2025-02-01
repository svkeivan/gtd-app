import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getIronSession } from "iron-session";
import { ironOptions } from "@/lib/config";
import { cookies } from "next/headers";
import { IronSessionData } from "iron-session";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
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

    return NextResponse.json({
      id: user.id,
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
