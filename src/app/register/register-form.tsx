"use client";

import { register } from "@/actions/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { format } from "date-fns";

function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Password requirements state
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const passwordRequirements = [
    { text: "At least 8 characters", met: password.length >= 8 },
    { text: "At least one uppercase letter", met: /[A-Z]/.test(password) },
    { text: "At least one lowercase letter", met: /[a-z]/.test(password) },
    { text: "At least one number", met: /[0-9]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await register(email, password);
      
      // Show success message with trial information
      if (result.subscription?.trialEndsAt) {
        const trialEndDate = format(new Date(result.subscription.trialEndsAt), 'MMMM do, yyyy');
        setSuccess(`Account created successfully! Your 15-day trial of Professional features ends on ${trialEndDate}.`);
      } else {
        setSuccess("Account created successfully!");
      }

      // Redirect after a short delay to show the success message
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Enter your email"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setShowPasswordRequirements(true)}
              required
              disabled={isLoading}
              placeholder="Choose a password"
              className="w-full"
            />
            {showPasswordRequirements && (
              <div className="mt-2 text-sm space-y-1">
                <p className="font-medium text-gray-700">Password requirements:</p>
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className={req.met ? "text-green-500" : "text-gray-400"}>
                      {req.met ? "✓" : "○"}
                    </span>
                    <span className={req.met ? "text-green-700" : "text-gray-600"}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !passwordRequirements.every(req => req.met)}
          >
            {isLoading ? "Creating Account..." : "Start Free Trial"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            By registering, you agree to our Terms of Service and Privacy Policy
          </p>
          <p className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

export default RegisterForm;
