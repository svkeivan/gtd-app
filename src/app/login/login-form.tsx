"use client";

import { login } from "@/actions/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Basic client-side validation
    if (!email.includes('@') || !email.includes('.')) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    if (password.length < 1) {
      setError("Please enter your password");
      setIsLoading(false);
      return;
    }

    try {
      await login(email, password);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      
      // Clear password field on error for security
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="dark:bg-gray-800">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="dark:text-gray-200">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Enter your email"
              className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
              autoComplete="email"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="dark:text-gray-200">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Enter your password"
              className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
              autoComplete="current-password"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
          <p className="text-center text-sm dark:text-gray-300">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline dark:text-blue-400">
              Register
            </Link>
          </p>
          <p className="text-center text-sm text-muted-foreground dark:text-gray-400">
            <Link href="/forgot-password" className="hover:underline">
              Forgot your password?
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

export default LoginForm;
