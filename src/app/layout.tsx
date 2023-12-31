import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "./ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "9notes",
  description:
    "Introducing Nine Notes, your new go-to app for note-taking with a twist. This isn’t just any notes app - it’s powered by advanced AI features that take your productivity to the next level.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
        <html lang="en">
          <body className={inter.className}>
            <ThemeProvider attribute="class">
            {children}
            </ThemeProvider>
            </body>
        </html>
    </ClerkProvider>
  );
}
