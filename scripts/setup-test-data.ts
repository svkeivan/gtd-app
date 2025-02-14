import { PrismaClient, PriorityLevel, ItemStatus } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Create test user
  const hashedPassword = await hash("testpass123", 10);
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      password: hashedPassword,
      name: "Test User",
      timezone: "UTC",
      workStartTime: "09:00",
      workEndTime: "17:00",
      lunchStartTime: "12:00",
      lunchDuration: 60,
      breakDuration: 15,
      longBreakDuration: 30,
      pomodoroDuration: 25,
      shortBreakInterval: 3,
      profileComplete: true,
    },
  });

  // Create contexts
  const contexts = await Promise.all([
    prisma.context.create({
      data: {
        name: "Work",
        description: "Tasks to be done at the office",
        userId: user.id,
        mondayEnabled: true,
        tuesdayEnabled: true,
        wednesdayEnabled: true,
        thursdayEnabled: true,
        fridayEnabled: true,
        startTime: "09:00",
        endTime: "17:00",
      },
    }),
    prisma.context.create({
      data: {
        name: "Home",
        description: "Tasks to be done at home",
        userId: user.id,
        mondayEnabled: true,
        tuesdayEnabled: true,
        wednesdayEnabled: true,
        thursdayEnabled: true,
        fridayEnabled: true,
        saturdayEnabled: true,
        sundayEnabled: true,
        startTime: "18:00",
        endTime: "22:00",
      },
    }),
    prisma.context.create({
      data: {
        name: "Errands",
        description: "Tasks that require going out",
        userId: user.id,
        mondayEnabled: true,
        wednesdayEnabled: true,
        fridayEnabled: true,
        startTime: "10:00",
        endTime: "16:00",
      },
    }),
    prisma.context.create({
      data: {
        name: "Deep Work",
        description: "Tasks requiring focus and concentration",
        userId: user.id,
        mondayEnabled: true,
        tuesdayEnabled: true,
        wednesdayEnabled: true,
        thursdayEnabled: true,
        fridayEnabled: true,
        startTime: "09:00",
        endTime: "12:00",
      },
    }),
  ]);

  // Create tasks
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const tasks = await Promise.all([
    // Work tasks
    prisma.item.create({
      data: {
        title: "Quarterly Report Review",
        notes: "Review and finalize Q1 2025 report",
        status: ItemStatus.NEXT_ACTION,
        priority: PriorityLevel.HIGH,
        dueDate: tomorrow,
        estimated: 120,
        requiresFocus: true,
        userId: user.id,
        contexts: { connect: [{ id: contexts[0].id }, { id: contexts[3].id }] },
      },
    }),
    prisma.item.create({
      data: {
        title: "Team Meeting",
        notes: "Weekly sync with the development team",
        status: ItemStatus.NEXT_ACTION,
        priority: PriorityLevel.MEDIUM,
        dueDate: today,
        estimated: 60,
        requiresFocus: false,
        userId: user.id,
        contexts: { connect: [{ id: contexts[0].id }] },
      },
    }),
    // Home tasks
    prisma.item.create({
      data: {
        title: "Laundry",
        notes: "Do weekly laundry",
        status: ItemStatus.NEXT_ACTION,
        priority: PriorityLevel.LOW,
        dueDate: tomorrow,
        estimated: 45,
        requiresFocus: false,
        userId: user.id,
        contexts: { connect: [{ id: contexts[1].id }] },
      },
    }),
    // Errands
    prisma.item.create({
      data: {
        title: "Grocery Shopping",
        notes: "Buy groceries for the week",
        status: ItemStatus.NEXT_ACTION,
        priority: PriorityLevel.MEDIUM,
        dueDate: today,
        estimated: 60,
        requiresFocus: false,
        userId: user.id,
        contexts: { connect: [{ id: contexts[2].id }] },
      },
    }),
    // Deep work tasks
    prisma.item.create({
      data: {
        title: "Project Proposal",
        notes: "Write proposal for new client project",
        status: ItemStatus.NEXT_ACTION,
        priority: PriorityLevel.URGENT,
        dueDate: tomorrow,
        estimated: 180,
        requiresFocus: true,
        userId: user.id,
        contexts: { connect: [{ id: contexts[0].id }, { id: contexts[3].id }] },
      },
    }),
    // Mixed context tasks
    prisma.item.create({
      data: {
        title: "Update Documentation",
        notes: "Update project documentation with recent changes",
        status: ItemStatus.NEXT_ACTION,
        priority: PriorityLevel.MEDIUM,
        dueDate: nextWeek,
        estimated: 90,
        requiresFocus: true,
        userId: user.id,
        contexts: { connect: [{ id: contexts[0].id }, { id: contexts[3].id }] },
      },
    }),
  ]);

  // Create some existing calendar events
  const existingEvents = await Promise.all([
    prisma.focusSession.create({
      data: {
        startTime: new Date(today.setHours(10, 0, 0, 0)),
        endTime: new Date(today.setHours(11, 0, 0, 0)),
        duration: 60,
        completed: true,
        userId: user.id,
        itemId: tasks[0].id,
      },
    }),
    prisma.breakSession.create({
      data: {
        startTime: new Date(today.setHours(12, 0, 0, 0)),
        endTime: new Date(today.setHours(13, 0, 0, 0)),
        duration: 60,
        type: "LUNCH",
        completed: true,
        userId: user.id,
      },
    }),
  ]);

  console.log("Test data created successfully!");
  console.log("Test user credentials:");
  console.log("Email: test@example.com");
  console.log("Password: testpass123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });