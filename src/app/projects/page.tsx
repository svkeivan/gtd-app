import { getProjects } from "../../actions/projects";
import { ProjectList } from "./project-list";
import { ProjectForm } from "./project-form";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProjectsPage() {
  const { user } = await auth();

  if (!user || !user.isLoggedIn) {
    redirect("/login");
  }

  const projects = await getProjects(user.id);

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Projects</h1>
      <ProjectForm userId={user.id} />
      <ProjectList initialProjects={projects} />
    </div>
  );
}
