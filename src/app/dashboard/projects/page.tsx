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

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Projects</h1>
      <ProjectForm userId={user.id} />
      <ProjectList initialProjects={projects} />
    </div>
  );
}
