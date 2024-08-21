"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import AddNoteDialog from "@/components/AddEditNoteDialog";
import ThemeToggleButton from "@/components/ThemeToggleButton";
import { useTheme } from "next-themes";
import { UserButton } from "@/components/UserButton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function NavBar({ user }: { user: any }) {
  const { theme } = useTheme();

  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 720);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  return (
    <>
      <div className="p-4 shadow-sm" style={{ boxSizing: "border-box" }}>
        <div className="m-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <Link href={"/notes"} className="flex items-center gap-1">
            <Image src={logo} alt="9 notes logo" width={40} height={40} />
            <span className="font-bold">9ine notes</span>
          </Link>
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              </SheetTrigger>
              <SheetContent className="ml-0 pl-0 pr-0">
                <SheetHeader>
                  <SheetTitle className="pl-3">
                    <Link href={"/notes"} className="flex items-center gap-1">
                      <Image
                        src={logo}
                        alt="9 notes logo"
                        width={40}
                        height={40}
                      />
                      <span className="font-bold">9ine notes</span>
                    </Link>
                  </SheetTitle>
                  <SheetDescription className="pl-5 text-left">
                    An AI powered note taking app
                  </SheetDescription>
                </SheetHeader>
                <div className="items flex flex-col justify-end gap-5 py-5">
                  <div className="mr-3 flex items-center justify-end gap-3">
                    <span className="text-sm">
                    {user.user_metadata?.full_name
                      ? user.user_metadata.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : user.email}
                      </span>
                    <UserButton user={user} />
                  </div>
                  <div className="mr-3 flex items-center justify-end gap-3">
                    <span className="text-sm">Change theme</span>
                    <ThemeToggleButton />
                  </div>
                  <Button
                    onClick={() => setShowAddNoteDialog(true)}
                    className="mx-auto w-5/6"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Note
                  </Button>
                </div>
                <SheetFooter className="absolute bottom-2 flex h-auto w-full justify-center text-center text-xs">
                  <span>
                    Built with 💖 by{" "}
                    <Link
                      href="https://linktr.ee/ayane.9"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500"
                    >
                      Felix
                    </Link>
                  </span>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="flex items-center gap-4">
              <UserButton user={user} />
              <ThemeToggleButton />
              <Button onClick={() => setShowAddNoteDialog(true)}>
                <Plus size={16} className="mr-2" />
                Add Note
              </Button>
            </div>
          )}
        </div>
      </div>
      <AddNoteDialog open={showAddNoteDialog} setOpen={setShowAddNoteDialog} />
    </>
  );
}
