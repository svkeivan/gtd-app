import { getNextActionsWithDetails } from "@/actions/items";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NextActionsList } from "./next-actions-list";

export default async function NextActionsPage() {
  const { user } = await auth();

  if (!user || !user.isLoggedIn) {
    redirect("/login");
  }

  const { nextActions, projects, contexts } = await getNextActionsWithDetails(
    user.id,
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Next Actions</h1>
      <NextActionsList
        initialNextActions={nextActions}
        projects={projects}
        contexts={contexts}
        userId={user.id}
      />
    </div>
  );
}
