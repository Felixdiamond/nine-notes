import AddBtn from "@/components/AddBtn";
import ChatBtn from "@/components/ChatBtn";
import Note from "@/components/Note";
import prisma from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs";
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
      <div className="min-h-[calc(100vh-105px)] p-4">
        {allNotes.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {allNotes.map((note) => (
              <Note note={note} key={note.id} />
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center">
            <h1 className="mb-4 text-2xl font-bold">You have no notes yet</h1>
            <AddBtn />
          </div>
        )}
      </div>
      <ChatBtn />
    </>
  );
}
