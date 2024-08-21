"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { createBrowserClient } from '@/lib/supabase';
import { FaGoogle } from 'react-icons/fa';

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log("Sign In successful");
        toast({
          title: "Sign In successful",
          description: "You have successfully signed in",
        });
        router.refresh();
        router.push('/notes');
        router.refresh();
      } else {
        throw new Error(data.error || "Sign In failed");
      }
    } catch (error) {
      console.error("Sign In error:", error);
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
        description: "An error occurred during Google sign-in",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
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
                  Sign In with Google
                </>
              ) : (
                <>
                  <FaGoogle className="mr-3" />
                  Sign In with Google
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
                'Sign In'
              )}
            </Button>
          </form>
          <div className="text-center mt-4">
            <span>Don&apos;t have an account yet? <Link href="/auth/sign-up" className="text-blue-500 font-semibold" prefetch>Sign Up</Link></span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInPage;