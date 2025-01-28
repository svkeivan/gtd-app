import { getProjects } from "@/actions/projects";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProjectForm } from "./project-form";
import { ProjectList } from "./project-list";

export default async function ProjectsPage() {
  const { user } = await auth();

  if (!user || !user.isLoggedIn) {
    redirect("/login");
  }

  const projects = await getProjects(user.id);
  const activeProjects = projects.filter((p) => p.status === "ACTIVE");
  const completedProjects = projects.filter((p) => p.status === "COMPLETED");
  const onHoldProjects = projects.filter((p) => p.status === "ON_HOLD");

  return (
    <div className="container mx-auto space-y-8 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-gray-600">Manage and track your projects</p>
        </div>
      </div>

      <ProjectForm userId={user.id} />

      <div className="space-y-8">
        {activeProjects.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold">Active Projects</h2>
            <ProjectList initialProjects={activeProjects} />
          </section>
        )}

        {onHoldProjects.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold">On Hold</h2>
            <ProjectList initialProjects={onHoldProjects} />
          </section>
        )}

        {completedProjects.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold">Completed</h2>
            <ProjectList initialProjects={completedProjects} />
          </section>
        )}

        {projects.length === 0 && (
          <div className="py-12 text-center">
            <h3 className="mb-2 text-xl font-medium text-gray-600">
              No projects yet
            </h3>
            <p className="text-gray-500">
              Create your first project to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
