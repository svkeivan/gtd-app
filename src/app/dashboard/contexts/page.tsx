import { ContextList } from "./context-list";
import { ContextForm } from "./context-form";
import { auth } from "@/lib/auth";
import { getContexts } from "@/actions/contexts";

export default async function ContextsPage() {
  const session = await auth();
  if (!session?.user) {
    return <div>Please sign in to view your contexts.</div>;
  }

  const contexts = await getContexts(session.user.id);

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Contexts</h1>
      <ContextForm userId={session.user.id} />
      <ContextList initialContexts={contexts} />
    </div>
  );
}
