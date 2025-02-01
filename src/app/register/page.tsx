import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import RegisterForm from "./register-form";

export default async function RegisterPage() {
  const { user } = await auth();

  if (user?.isLoggedIn) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="mb-4 text-center text-2xl font-bold">Register</h1>
        <RegisterForm />
      </div>
    </div>
  );
}
