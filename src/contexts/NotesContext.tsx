'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Note } from '@prisma/client';

interface NotesContextType {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  addNote: (note: Note) => void;
  updateNote: (updatedNote: Note) => void;
  deleteNote: (id: string) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    // Fetch initial notes from the server
    fetch('/api/notes')
      .then(response => response.json())
      .then(data => setNotes(data.notes));
  }, []);

  const addNote = (note: Note) => {
    setNotes(prevNotes => [...prevNotes, note]);
  };

  const updateNote = (updatedNote: Note) => {
    setNotes(prevNotes =>
      prevNotes.map(note => (note.id === updatedNote.id ? updatedNote : note))
    );
  };

  const deleteNote = (id: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
  };

  return (
    <NotesContext.Provider value={{ notes, setNotes, addNote, updateNote, deleteNote }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};