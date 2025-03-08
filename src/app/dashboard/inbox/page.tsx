import { getInboxItems } from "@/actions/items";
import { InboxForm } from "./inbox-form";
import { InboxList } from "./inbox-list";
import { inboxTr } from "@/lib/translations/inbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecentlyCaptured } from "./recently-captured";
import { InboxStats } from "./inbox-stats";

export default async function InboxPage() {
  const items = await getInboxItems();
  
  // Get recently captured items (last 24 hours)
  const recentItems = items.filter(
    (item) => new Date().getTime() - new Date(item.createdAt).getTime() < 24 * 60 * 60 * 1000
  );

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">{inboxTr['Inbox']||'Inbox'}</h1>
          <p className="text-muted-foreground">
            {inboxTr['Description']||'Capture thoughts, tasks, and ideas quickly. Process them later into organized actions.'}
          </p>
        </div>
        <InboxStats items={items} />
      </div>
      
      <Tabs defaultValue="capture" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="capture">{inboxTr['CaptureNew']||'Capture New'}</TabsTrigger>
          <TabsTrigger value="process">{inboxTr['ProcessItems']||'Process Items'}</TabsTrigger>
        </TabsList>
        <TabsContent value="capture" className="space-y-6">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <InboxForm />
          </div>
          {recentItems.length > 0 && <RecentlyCaptured items={recentItems} />}
        </TabsContent>
        <TabsContent value="process">
          <InboxList initialItems={items} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
