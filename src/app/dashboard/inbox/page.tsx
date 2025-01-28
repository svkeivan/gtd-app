import { getInboxItems } from "@/actions/items";
import { auth } from "@/lib/auth";
import { InboxForm } from "./inbox-form";
import { InboxList } from "./inbox-list";

export default async function InboxPage() {
  const session = await auth();
  if (!session?.user) {
    return <div>Please sign in to view your inbox.</div>;
  }

  const items = await getInboxItems(session.user.id);

  return (
    <div className="container mx-auto p-4">
      <InboxForm />
      <InboxList initialItems={items} />
    </div>
  );
}
