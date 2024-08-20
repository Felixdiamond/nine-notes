"use client";

import { NotesProvider } from "@/contexts/NotesContext";
import React, { useState } from "react";
import {
  createClientComponentClient,
  Session,
} from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { Database } from "@/lib/database.types";

export default function ClientNotesProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const [supabaseClient] = useState(() =>
    createClientComponentClient<Database>(),
  );

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={session}
    >
      <NotesProvider>{children}</NotesProvider>
    </SessionContextProvider>
  );
}
