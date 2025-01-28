import { getTags } from "@/actions/tags";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TagForm } from "./tag-form";
import { TagList } from "./tag-list";

export default async function TagsPage() {
  const { user } = await auth();

  if (!user || !user.isLoggedIn) {
    redirect("/login");
  }

  const tags = await getTags(user.id);

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Tags</h1>
      <TagForm userId={user.id} />
      <TagList initialTags={tags} />
    </div>
  );
}
