"use client";

import { NotesProvider } from "@/contexts/NotesContext";
import React, { useState } from "react";

export default function ClientNotesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NotesProvider>{children}</NotesProvider>;
}
