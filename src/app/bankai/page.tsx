"use client";
import { useEffect } from "react";
import { createBrowserClient } from '@/lib/supabase';
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function TestPage() {
  const { session, user } = useAuth();
  const supabase = createBrowserClient();

  useEffect(() => {
    console.log("session from test page", session);
  }, [session]);

  useEffect(() => {
    console.log("user from test page", user);
  }, [user]);

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      console.log("Direct session check", data.session, error);
    };
    checkSession();
  }, [supabase]);

  return (
    <div>
      <h1>Test Page</h1>
      {user ? <p>Logged in as: {user.email}</p> : <p>Not logged in</p>}

      <Link href="/auth/sign-in">Go to login</Link>
    </div>
  )
}