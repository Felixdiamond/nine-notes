import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./ThemeProvider";
import ClientNotesProvider from "@/components/ClientNotesProvider";
import { Toaster } from "@/components/ui/toaster";
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { headers, cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "9notes",
  description:
    "Introducing Nine Notes, your new go-to app for note-taking with a twist. This isn't just any notes app - it's powered by advanced AI features that take your productivity to the next level.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient<Database>({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientNotesProvider session={session}>
          <ThemeProvider attribute="class">{children}</ThemeProvider>
          <Toaster />
        </ClientNotesProvider>
      </body>
    </html>
  );
}