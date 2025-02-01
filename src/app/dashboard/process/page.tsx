import { getContexts } from "@/actions/contexts";
import { getInboxCount, getItemToProcess } from "@/actions/items";
import { getProjects } from "@/actions/projects";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { auth } from "@/lib/auth";
import { CheckCircle2, InboxIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { ProcessForm } from "./process-form";

export default async function ProcessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
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

  const [projects, contexts, totalInbox] = await Promise.all([
    getProjects(user.id),
    getContexts(user.id),
    getInboxCount(user.id),
  ]);

  if (!item) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Process Inbox</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <InboxIcon className="h-5 w-5" />
            <span>0 items remaining</span>
          </div>
        </div>
        <Card className="py-12 text-center">
          <CardContent className="flex flex-col items-center gap-4">
            <CheckCircle2 className="h-12 w-12 text-primary" />
            <h2 className="text-2xl font-semibold">All Clear!</h2>
            <p className="text-muted-foreground">
              You&apos;ve processed all items in your inbox. Well done!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const remainingItems = totalInbox;
  const progress = Math.max(
    0,
    Math.min(100, ((totalInbox - remainingItems) / totalInbox) * 100),
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Process Inbox</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <InboxIcon className="h-5 w-5" />
            <span>{remainingItems} items remaining</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Processing Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>
      <ProcessForm item={item} projects={projects} contexts={contexts} />
    </div>
  );
}
