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
import { formatDistanceToNow } from "date-fns";
import { Dot } from "lucide-react";

interface NoteProps {
  note: NoteModel;
}

export default function Note({ note }: NoteProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Ensure note data is valid
  const hasTitle = Boolean(note.title);
  const hasContent = Boolean(note.content);
  const hasUpdatedAt = Boolean(note.updatedAt);
  const hasCreatedAt = Boolean(note.createdAt);

  // Handle timestamp formatting
  const wasUpdated = hasUpdatedAt && hasCreatedAt && note.updatedAt > note.createdAt;
  const timeAgo = wasUpdated
    ? formatDistanceToNow(note.updatedAt, { addSuffix: true })
    : hasCreatedAt
    ? formatDistanceToNow(note.createdAt, { addSuffix: true })
    : "Just now";

  return (
    <>
      <Card
        className="cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        onClick={() => setShowEditDialog(true)}
      >
        <CardHeader>
          <CardTitle className="truncate text-xl font-bold">
            {hasTitle ? note.title : "Untitled"}
          </CardTitle>
          <CardDescription className="text-sm text-gray-700 dark:text-gray-200">
            <div className="flex">
              {timeAgo}
              {wasUpdated && <Dot />}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-4">
          <div className="line-clamp-3 whitespace-pre-line text-gray-600 sm:text-sm">
            {hasContent ? note.content : "No content"}
          </div>
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
