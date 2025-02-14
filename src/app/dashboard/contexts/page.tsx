import { ContextList } from "./context-list";
import { ContextForm } from "./context-form";
import { auth } from "@/lib/auth";
import { getContexts, type ContextWithItems } from "@/actions/contexts";
import { Layers } from "lucide-react";
import { ContextsPageHint } from "./page-hint";
import { redirect } from "next/navigation";

export default async function ContextsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const result = await getContexts();
  
  if (result.error) {
    throw new Error(result.error);
  }

  if (!result.data) {
    throw new Error("Failed to load contexts");
  }

  return (
    <div className='container mx-auto p-4 space-y-6'>
      <div className="flex items-center gap-3 border-b pb-4">
        <Layers className="h-8 w-8 text-muted-foreground" />
        <div>
          <h1 className='text-2xl font-bold'>Contexts</h1>
          <p className="text-muted-foreground">
            Organize tasks based on location, tools, or conditions needed to complete them
          </p>
        </div>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-[400px,1fr] xl:grid-cols-[400px,1fr,300px]">
        <div className="space-y-6">
          <div className="max-w-md">
            <ContextForm userId={session.user.id} />
          </div>
          <div className="block lg:hidden">
            <ContextsPageHint />
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Contexts</h2>
          <ContextList initialContexts={result.data} />
        </div>
        <div className="hidden xl:block">
          <div className="sticky top-4">
            <ContextsPageHint />
          </div>
        </div>
      </div>
    </div>
  );
}
