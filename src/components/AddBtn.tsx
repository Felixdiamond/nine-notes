"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import AddNoteDialog from "./AddEditNoteDialog";

export default function AddBtn() {
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
  return (
    <>
      <Button className="mt-3" onClick={() => setShowAddNoteDialog(true)}>
        <Plus size={16} className="mr-2" />
        Add Note
      </Button>
      <AddNoteDialog open={showAddNoteDialog} setOpen={setShowAddNoteDialog} />
    </>
  );
}
