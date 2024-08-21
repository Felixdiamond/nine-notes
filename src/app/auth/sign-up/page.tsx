"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { FaGoogle } from "react-icons/fa";
import { createBrowserClient } from "@/lib/supabase";

const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, image }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Sign Up successful");
        toast({
          title: "Sign Up successful",
          description:
            "You have successfully signed up, please confirm your email before sign in",
        });
        router.refresh();
        router.push("/auth/sign-in");
        router.refresh();
      } else {
        throw new Error(data.error || "Sign Up failed");
      }
    } catch (error) {
      console.error("Sign Up error:", error);
      setError(error.message);
      toast({
        title: "An error occurred",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);

    const supabase = createBrowserClient();
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
      })
    } catch (error) {
      console.error('Google sign-up error:', error)
      toast({
        title: "An error occurred",
        description: "An error occurred during Google sign-up",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Sign Up
          </CardTitle>
          <CardDescription className="text-center">
            Create an account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Button
              variant="outline"
              className="flex w-full items-center justify-center"
              disabled={googleLoading}
              onClick={handleGoogleSignUp}
            >
              {googleLoading ? (
                <>
                  <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                  Sign Up with Google
                </>
              ) : (
                <>
                  <FaGoogle className="mr-3" />
                  Sign Up with Google
                </>
              )}
            </Button>
          </div>
          <div className="mb-4 mt-4 flex items-center justify-center space-x-3">
            <hr className="w-full" />
            <p className="text-center">or</p>
            <hr className="w-full" />
          </div>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Profile Image (Optional)</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <span>
              Already have an account?{" "}
              <Link
                href="/auth/sign-in"
                className="font-semibold text-blue-500"
                prefetch
              >
                Sign In
              </Link>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpPage;
