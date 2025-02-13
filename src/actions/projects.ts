"use server";

import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/safe-action";
import {
  AuthenticationError,
  NotFoundError,
  ValidationError,
  handlePrismaError,
} from "@/lib/errors";

const prisma = new PrismaClient();

// Implementation functions
async function getProjectsImpl() {
  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  try {
    const projects = await prisma.project.findMany({
      where: {
        userId: user.id,
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return projects;
  } catch (error) {
    handlePrismaError(error);
  }
}

async function getProjectImpl(projectId: string) {
  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  try {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        items: true,
      },
    });

    if (!project) {
      throw new NotFoundError("Project", projectId);
    }

    // Verify ownership
    if (project.userId !== user.id) {
      throw new AuthenticationError("Not authorized to view this project");
    }

    return project;
  } catch (error) {
    handlePrismaError(error);
  }
}

async function createProjectImpl(data: {
  title: string;
  description?: string;
  status?: string;
}) {
  // Validate input
  if (!data.title?.trim()) {
    throw new ValidationError("Project title is required");
  }

  if (data.title.length > 100) {
    throw new ValidationError("Project title must be less than 100 characters");
  }

  if (data.description && data.description.length > 500) {
    throw new ValidationError("Project description must be less than 500 characters");
  }

  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  try {
    // Check project limit (if any)
    const projectCount = await prisma.project.count({
      where: { userId: user.id },
    });

    // This could be replaced with actual limit from subscription
    const PROJECT_LIMIT = 100;
    if (projectCount >= PROJECT_LIMIT) {
      throw new ValidationError(`You have reached the maximum limit of ${PROJECT_LIMIT} projects`);
    }

    const project = await prisma.project.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status || "ACTIVE",
        userId: user.id,
      },
    });

    revalidatePath("/projects");
    return project;
  } catch (error) {
    handlePrismaError(error);
  }
}

async function updateProjectImpl(
  projectId: string,
  data: { title: string; status: string; description?: string },
) {
  // Validate input
  if (!data.title?.trim()) {
    throw new ValidationError("Project title is required");
  }

  if (data.title.length > 100) {
    throw new ValidationError("Project title must be less than 100 characters");
  }

  if (data.description && data.description.length > 500) {
    throw new ValidationError("Project description must be less than 500 characters");
  }

  if (!["ACTIVE", "COMPLETED", "ON_HOLD", "CANCELLED"].includes(data.status)) {
    throw new ValidationError("Invalid project status");
  }

  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  try {
    // Verify project exists and user owns it
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      throw new NotFoundError("Project", projectId);
    }

    if (existingProject.userId !== user.id) {
      throw new AuthenticationError("Not authorized to modify this project");
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        title: data.title,
        status: data.status,
        description: data.description,
      },
    });

    revalidatePath("/projects");
    return project;
  } catch (error) {
    handlePrismaError(error);
  }
}

async function deleteProjectImpl(projectId: string) {
  const { user } = await auth();
  if (!user) throw new AuthenticationError();

  try {
    // Verify project exists and user owns it
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      throw new NotFoundError("Project", projectId);
    }

    if (existingProject.userId !== user.id) {
      throw new AuthenticationError("Not authorized to delete this project");
    }

    // Check if project has any items
    const itemCount = await prisma.item.count({
      where: { projectId },
    });

    if (itemCount > 0) {
      throw new ValidationError(
        "Cannot delete project with existing items. Please move or delete the items first."
      );
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    revalidatePath("/projects");
  } catch (error) {
    handlePrismaError(error);
  }
}

// Export wrapped actions
export const getProjects = createSafeAction(getProjectsImpl);
export const getProject = createSafeAction(getProjectImpl);
export const createProject = createSafeAction(createProjectImpl);
export const updateProject = createSafeAction(updateProjectImpl);
export const deleteProject = createSafeAction(deleteProjectImpl);
