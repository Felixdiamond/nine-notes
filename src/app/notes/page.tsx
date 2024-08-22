"use client";
import { useNotes } from "@/contexts/NotesContext";
import AddBtn from "@/components/AddBtn";
import ChatManager from "@/components/ChatManager";
import Note from "@/components/Note";
import { Loader } from "./layout";

export default function NotesPage() {
  const { notes, loading, error, currentPage, totalPages, loadMoreNotes } = useNotes();

  // Ensure notes is always an array
  const validNotes = Array.isArray(notes) ? notes : [];

  return (
    <>
      <div className="min-h-[calc(100vh-105px)] p-4">
        {loading && <div className="flex items-center justify-center"><Loader /></div>}
        {!loading && !error && validNotes.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {validNotes.map((note) => (
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
        )}
        {validNotes.length === 0 && !loading && !error && (
          <div className="flex h-full flex-col items-center justify-center">
            <h1 className="mb-4 text-2xl font-bold">You have no notes yet</h1>
            <AddBtn />
          </div>
        )}
        {error && <p className="text-center text-sm mt-5">{error}</p>}
      </div>
      <ChatManager />
    </>
  );
}