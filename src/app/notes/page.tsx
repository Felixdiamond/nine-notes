// app/notes/page.tsx
"use client";

import { useNotes } from "@/contexts/NotesContext";
import AddBtn from "@/components/AddBtn";
import ChatManager from "@/components/ChatManager";
import Note from "@/components/Note";

export default function NotesPage() {
  const { notes } = useNotes();

  return (
    <>
      <div className="min-h-[calc(100vh-105px)] p-4">
        {notes.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
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
      <ChatManager />
    </>
  );
}