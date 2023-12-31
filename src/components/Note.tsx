"use client";

import { Note as NoteModel } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import AddNoteDialog from "./AddEditNoteDialog";
import { useState } from "react";

interface NoteProps {
  note: NoteModel;
}

export default function Note({ note }: NoteProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const wasUpdated = note.updatedAt > note.createdAt;

  const leTimestamp = (
    wasUpdated ? note.updatedAt : note.createdAt
  ).toDateString();

  return (
    <>
      <Card className="cursor-pointer transition-shadow hover:shadow-mdm" onClick={() => setShowEditDialog(true)}>
        <CardHeader>
          <CardTitle>{note.title}</CardTitle>
          <CardDescription className="text-sm">
            {leTimestamp}
            {wasUpdated && " (updated)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line text-gray-500 sm:text-sm">
            {note.content}
          </p>
        </CardContent>
      </Card>
      <AddNoteDialog
        open={showEditDialog}
        setOpen={setShowEditDialog}
        noteToEdit={note}
      />
    </>
  );
}
