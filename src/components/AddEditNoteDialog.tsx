import { CreateNoteSchema, createNoteSchema } from "@/lib/validation/note";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import LoadingButton from "./ui/loading-button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { Note } from "@prisma/client";
import { useState } from "react";
import { useNotes } from "@/contexts/NotesContext";
import { useToast } from "@/components/ui/use-toast";

interface AddNoteDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  noteToEdit?: Note;
}

export default function AddNoteDialog({
  open,
  setOpen,
  noteToEdit,
}: AddNoteDialogProps) {
  const [deletionInProgress, setDeletionInProgress] = useState(false);
  const { addNote, updateNote, deleteNote } = useNotes();
  const { toast } = useToast();

  const form = useForm<CreateNoteSchema>({
    resolver: zodResolver(createNoteSchema),
    defaultValues: {
      title: noteToEdit?.title || "",
      content: noteToEdit?.content || "",
    },
  });

  async function onSubmit(input: CreateNoteSchema) {
    try {
      if (noteToEdit) {
        const updatedNote: Note = {
          ...noteToEdit,
          ...input,
          content: input.content || null,
        };
        
        const response = await fetch("/api/notes", {
          method: "PUT",
          body: JSON.stringify({
            id: noteToEdit.id,
            ...input,
            content: input.content || null,
          }),
        });
        if (!response.ok) throw new Error("Status code: " + response.status);
        
        const savedNote: Note = await response.json();
        updateNote(savedNote);
        setOpen(false);
      } else {
        const newNote: Omit<Note, "id"> = {
          ...input,
          content: input.content || null,
          userId: "temp-user-id",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
  
        const response = await fetch("/api/notes", {
          method: "POST",
          body: JSON.stringify(newNote),
        });
        if (!response.ok) throw new Error("Status code: " + response.status);
        
        const savedNote: Note = await response.json();
        addNote(savedNote);
        setOpen(false);
      }
      form.reset();
    } catch (error) {
      console.error(error);
      toast({
        title: "An error occurred",
        description: "Failed to save the note. Please try again.",
      });
    }
  }

  async function handleDelete() {
    if (!noteToEdit) return;
    setDeletionInProgress(true);
    try {
      await deleteNote(noteToEdit.id);
      setOpen(false);

      const response = await fetch("/api/notes", {
        method: "DELETE",
        body: JSON.stringify({
          id: noteToEdit.id,
        }),
      });
      if (!response.ok) throw new Error("Status code: " + response.status);
    } catch (error) {
      console.error(error);
      toast({
        title: "An error occurred",
        description: "Failed to delete the note. Please try again.",
      });
    } finally {
      setDeletionInProgress(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {noteToEdit ? "Edit Note" : "Add Note"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Note title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter note title"
                      {...field}
                      className="p-3 text-lg"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Note content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter note content"
                      {...field}
                      className="min-h-[200px] p-3 text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-4">
              {noteToEdit && (
                <LoadingButton
                  variant="destructive"
                  loading={deletionInProgress}
                  disabled={form.formState.isSubmitting || deletionInProgress}
                  onClick={() => handleDelete()}
                  type="button"
                  className="w-full sm:w-auto"
                >
                  Delete note
                </LoadingButton>
              )}
              <LoadingButton
                type="submit"
                loading={form.formState.isSubmitting}
                disabled={form.formState.isSubmitting || deletionInProgress}
                className="w-full sm:w-auto"
              >
                {noteToEdit ? "Save changes" : "Add note"}
              </LoadingButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
