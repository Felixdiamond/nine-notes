// contexts/NotesContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { Note } from "@prisma/client";

interface NotesContextType {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  addNote: (note: Note) => Promise<void>;
  updateNote: (updatedNote: Note) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      console.log("Fetching notes...")
      const response = await fetch("/api/notes");
      if (!response.ok) throw new Error("Failed to fetch notes");
      const data = await response.json();
      setNotes(data);
    } catch (err) {
      setError("Failed to load notes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (note: Note) => {
    const optimisticNote = { ...note, id: Date.now().toString() };
    setNotes((prevNotes) => [...prevNotes, optimisticNote]);
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note),
      });
      if (!response.ok) throw new Error("Failed to add note");
      const savedNote = await response.json();
      setNotes((prevNotes) =>
        prevNotes.map((n) => (n.id === optimisticNote.id ? savedNote : n)),
      );
    } catch (err) {
      setNotes((prevNotes) =>
        prevNotes.filter((n) => n.id !== optimisticNote.id),
      );
      throw err;
    }
  };

  const updateNote = async (updatedNote: Note) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === updatedNote.id ? updatedNote : note,
      ),
    );
    try {
      const response = await fetch("/api/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedNote),
      });
      if (!response.ok) throw new Error("Failed to update note");
      const savedNote = await response.json();
      setNotes((prevNotes) =>
        prevNotes.map((note) => (note.id === savedNote.id ? savedNote : note)),
      );
    } catch (err) {
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === updatedNote.id ? note : updatedNote,
        ),
      );
      throw err;
    }
  };

  const deleteNote = async (id: string) => {
    const noteToDelete = notes.find((note) => note.id === id);
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    try {
      const response = await fetch("/api/notes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("Failed to delete note");
    } catch (err) {
      if (noteToDelete) setNotes((prevNotes) => [...prevNotes, noteToDelete]);
      throw err;
    }
  };

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
