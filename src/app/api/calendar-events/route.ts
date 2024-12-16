import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { user } = await auth();

  if (!user || !user.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, start } = await request.json();

    const newEvent = await prisma.item.create({
      data: {
        title,
        status: "SCHEDULED",
        dueDate: new Date(start),
        userId: user.id,
      },
    });

    return NextResponse.json({
      id: newEvent.id,
      title: newEvent.title,
      start: newEvent.dueDate,
      end: newEvent.dueDate,
      allDay: true,
    });
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return NextResponse.json(
      { error: "Failed to create calendar event" },
      { status: 500 },
    );
  }
}
