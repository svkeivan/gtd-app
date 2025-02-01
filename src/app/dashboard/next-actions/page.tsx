import { getNextActionsWithDetails } from "@/actions/items";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NextActionsList } from "./next-actions-list";
import { NextActionsPageHint } from "./page-hint";

export default async function NextActionsPage() {
  const { user } = await auth();

  if (!user || !user.isLoggedIn) {
    redirect("/login");
  }

  const { nextActions, projects, contexts } = await getNextActionsWithDetails(
    user.id,
  );

  return (
    <div className="container mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold">Next Actions</h1>
        <p className="text-gray-600">Organize and track your next actionable items</p>
      </div>

      <NextActionsPageHint />
      <NextActionsList
        initialNextActions={nextActions}
        projects={projects}
        contexts={contexts}
        userId={user.id}
      />
    </div>
  );
}
