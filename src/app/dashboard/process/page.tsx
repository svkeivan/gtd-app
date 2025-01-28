import { getItemToProcess } from "@/actions/items";
import { ProcessForm } from "./process-form";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProjects } from "@/actions/projects";
import { getContexts } from "@/actions/contexts";

export default async function ProcessPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const { user } = await auth();
  if (!user || !user.isLoggedIn) {
    redirect("/login");
  }

  const Params = await searchParams;
  const { id: itemId } = Params;
  const item = itemId
    ? await getItemToProcess(itemId)
    : await getItemToProcess(user.id);

  if (!item) {
    return (
      <div className='container mx-auto p-4'>
        <h1 className='text-2xl font-bold mb-4'>Process Inbox</h1>
        <p>No items to process. Great job!</p>
      </div>
    );
  }

  const projects = await getProjects(user.id);
  const contexts = await getContexts(user.id);

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Process Inbox</h1>
      <ProcessForm
        item={item}
        projects={projects}
        contexts={contexts}
      />
    </div>
  );
}
