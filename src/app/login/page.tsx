import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "./login-form";

function LoginFormWrapper() {
  return (
    <div className="w-full max-w-md">
      <h1 className="mb-4 text-center text-2xl font-bold">Login</h1>
      <LoginForm />
    </div>
  );
}

export default async function LoginPage() {
  const { user } = await auth();

  if (user?.isLoggedIn) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoginFormWrapper />
    </div>
  );
}
