import { getTags } from "@/actions/tags";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TagForm } from "./tag-form";
import { TagList } from "./tag-list";
import { Tag } from "lucide-react";
import { TagsPageHint } from "./page-hint";

export default async function TagsPage() {
  const { user } = await auth();

  if (!user || !user.isLoggedIn) {
    redirect("/login");
  }

  const tags = await getTags(user.id);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <Tag className="h-8 w-8 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold">Tags</h1>
          <p className="text-muted-foreground">
            Organize and categorize your tasks with colorful, searchable tags
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[400px,1fr] xl:grid-cols-[400px,1fr,300px]">
        <div className="space-y-6">
          <div className="max-w-md">
            <TagForm userId={user.id} />
          </div>
          <div className="block lg:hidden">
            <TagsPageHint />
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Tags</h2>
          <TagList initialTags={tags} />
        </div>
        <div className="hidden xl:block">
          <div className="sticky top-4">
            <TagsPageHint />
          </div>
        </div>
      </div>
    </div>
  );
}
