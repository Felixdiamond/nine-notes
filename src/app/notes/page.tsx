import AddBtn from "@/components/AddBtn";
import ChatBtn from "@/components/ChatBtn";
import Note from "@/components/Note";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My notes - 9notes",
};

export default async function NotesPage() {
  const { userId } = auth();

  if (!userId) throw new Error("Not authenticated");

  const allNotes = await prisma.note.findMany({ where: { userId } });

  return (
    <>
    <div>
      {JSON.parse(JSON.stringify(allNotes)).length > 0 ? (
        <div className="grid h-full w-full gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {allNotes.map((note) => (
            <Note note={note} key={note.id} />
          ))}
        </div>
      ) : (
        <div
          className="flex h-full w-full flex-col items-center justify-center"
          style={{
            overflow: "auto",
            height: "calc(100vh - 105px)",
            boxSizing: "border-box",
            padding: "0px !important",
            margin: "0px !important",
          }}
        >
          <h1>You have no notes yet</h1>
          <AddBtn />
        </div>
      )}
    </div>
    <div>
    <ChatBtn />
    </div>
    </>
  );
}
