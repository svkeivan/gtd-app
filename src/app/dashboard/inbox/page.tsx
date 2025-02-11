import { getInboxItems } from "@/actions/items";
import { InboxForm } from "./inbox-form";
import { InboxList } from "./inbox-list";

export default async function InboxPage() {

  const items = await getInboxItems();

  return (
    <div className="container mx-auto space-y-8 p-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Inbox</h1>
        <p className="text-muted-foreground">
          Capture thoughts, tasks, and ideas quickly. Process them later into
          organized actions.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <InboxForm />
      </div>
      <InboxList initialItems={items} />
    </div>
  );
}
