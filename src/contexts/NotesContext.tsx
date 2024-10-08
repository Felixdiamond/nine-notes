import React, { createContext, useContext, useState, useEffect } from "react";
import { Note } from "@prisma/client";
import { useAuth } from "./AuthContext";
import { CreateNoteSchema } from "@/lib/validation/note";

interface NotesContextType {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  addNote: (note: CreateNoteSchema) => Promise<void>;
  updateNote: (updatedNote: Partial<Note> & { id: string }) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  loadMoreNotes: () => Promise<void>;
  refreshNotes: () => Promise<void>; 
  getNoteById: (id: string) => Note | undefined;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchNotes();
  }, [user]);

  const fetchNotes = async (page = 1) => {
    try {
      setLoading(true);
      console.log(`Fetching notes for page ${page}...`);
      const response = await fetch(`/api/notes?page=${page}&limit=10`);
      if (!response.ok) throw new Error("Failed to fetch notes");
      const data = await response.json();
      if (page === 1) {
        setNotes(data.notes);
      } else {
        setNotes((prevNotes) => [...prevNotes, ...data.notes]);
      }
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError("Failed to load notes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreNotes = async () => {
    if (currentPage < totalPages) {
      await fetchNotes(currentPage + 1);
    }
  };

  const addNote = async (note: CreateNoteSchema) => {
    console.log("adding note: " ,note)
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note),
      });
      if (!response.ok) throw new Error("Failed to add note");
      await response.json(); // Ensure the note is added

      // Refetch notes to include the newly added note
      await refreshNotes();
    } catch (err) {
      throw err;
    }
  };

  const updateNote = async (updatedNote: Partial<Note> & { id: string }) => {
    try {
      const response = await fetch("/api/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedNote),
      });
      if (!response.ok) throw new Error("Failed to update note");
      const savedNote: Note = await response.json();
      setNotes((prevNotes) =>
        prevNotes.map((note) => (note.id === savedNote.id ? savedNote : note))
      );

      // Refetch notes to include the updated note
      await refreshNotes();
    } catch (err) {
      throw err;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const response = await fetch("/api/notes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("Failed to delete note");
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));

      // Refetch notes to exclude the deleted note
      await refreshNotes();
    } catch (err) {
      throw err;
    }
  };

  // Function to refetch notes
  const refreshNotes = async () => {
    await fetchNotes(1); // Refetch notes from the first page
  };

  const getNoteById = (id: string) => {
    return notes.find((note) => note.id === id);
  }

  return (
    <NotesContext.Provider
      value={{
        notes,
        setNotes,
        addNote,
        updateNote,
        deleteNote,
        loading,
        error,
        currentPage,
        totalPages,
        loadMoreNotes,
        refreshNotes,
        getNoteById,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
}
