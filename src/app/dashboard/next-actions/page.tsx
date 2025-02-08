import { getNextActionsWithDetails } from "@/actions/items";
import { NextActionsList } from "./next-actions-list";
import { NextActionsPageHint } from "./page-hint";

export default async function NextActionsPage() {
  const { nextActions, projects, contexts } = await getNextActionsWithDetails();

  return (
    <div className="container mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold">Next Actions</h1>
        <p className="text-gray-600">
          Organize and track your next actionable items
        </p>
      </div>

      <NextActionsPageHint />
      <NextActionsList
        initialNextActions={nextActions}
        projects={projects}
        contexts={contexts}
      />
    </div>
  );
}
