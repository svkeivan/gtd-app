import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function Home() {
  const { user } = await auth();

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-24">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">Welcome to GTD App</h1>
        <p className="text-xl text-gray-600">
          A personal productivity app based on the Getting Things Done
          methodology
        </p>
      </div>

      {user?.isLoggedIn ? (
        <Link href="/dashboard">
          <Button size="lg">Go to Dashboard</Button>
        </Link>
      ) : (
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="default" size="lg">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg">
              Register
            </Button>
          </Link>
        </div>
      )}
    </main>
  );
}
