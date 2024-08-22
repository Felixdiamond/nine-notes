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
import { Note } from "@prisma/client";
import { useState } from "react";
import { useNotes } from "@/contexts/NotesContext";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Maximize2 } from "lucide-react";

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
  const router = useRouter();

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
        await updateNote({
          id: noteToEdit.id,
          ...input,
          content: input.content || null,
        });
      } else {
        await addNote(input);
      }
      setOpen(false);
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

  const handleFullScreen = () => {
    const noteId = noteToEdit ? noteToEdit.id : 'new';
    router.push(`/notes/${noteId}/edit`);
  };

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
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handleFullScreen}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <Maximize2 size={20} />
                Full Screen
              </button>
              <div className="flex gap-4">
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
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}