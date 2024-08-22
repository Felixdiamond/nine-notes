// page.tsx (app/notes/page.tsx)
"use client";
import { useNotes } from "@/contexts/NotesContext";
import AddBtn from "@/components/AddBtn";
import ChatManager from "@/components/ChatManager";
import Note from "@/components/Note";

export default function NotesPage() {
  const { notes, loading, error, currentPage, totalPages, loadMoreNotes } = useNotes();

  return (
    <>
      <div className="min-h-[calc(100vh-105px)] p-4">
        {notes.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {notes.map((note) => (
                <Note note={note} key={note.id} />
              ))}
            </div>
            {currentPage < totalPages && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={loadMoreNotes}
                  className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center">
            <h1 className="mb-4 text-2xl font-bold">You have no notes yet</h1>
            <AddBtn />
          </div>
        )}
        {error && <p className="text-center text-red-500">{error}</p>}
      </div>
      <ChatManager />
    </>
  );
}