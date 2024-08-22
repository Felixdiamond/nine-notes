"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useNotes } from '@/contexts/NotesContext';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createNoteSchema, CreateNoteSchema } from '@/lib/validation/note';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, Bold, Italic, List, Heading, Eye, Edit2, Code, Link } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function FullScreenEditor({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const { getNoteById, updateNote, addNote } = useNotes();
  const [isPreview, setIsPreview] = useState(false);

  const { control, handleSubmit, setValue, watch } = useForm<CreateNoteSchema>({
    resolver: zodResolver(createNoteSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  const content = watch('content');

  useEffect(() => {
    if (id && id !== 'new') {
      const note = getNoteById(id as string);
      if (note) {
        setValue('title', note.title);
        setValue('content', note.content || '');
      }
    }
  }, [id, getNoteById, setValue]);

  const onSubmit = async (data: CreateNoteSchema) => {
    try {
      if (id === 'new') {
        await addNote(data);
      } else {
        await updateNote({ id: id as string, ...data });
      }
      router.back();
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const insertMarkdown = useCallback((markdownSymbol: string, placeholder?: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const selectedText = text.substring(start, end);

      let newText;
      if (selectedText) {
        // If text is selected, wrap it with markdown
        newText = text.substring(0, start) + markdownSymbol + selectedText + markdownSymbol + text.substring(end);
      } else {
        // If no text is selected, insert markdown with placeholder
        newText = text.substring(0, start) + markdownSymbol + (placeholder || '') + markdownSymbol + text.substring(end);
      }

      setValue('content', newText);
      
      // Set cursor position
      setTimeout(() => {
        textarea.focus();
        const cursorPosition = start + markdownSymbol.length + (selectedText ? selectedText.length : 0);
        textarea.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    }
  }, [setValue]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 p-4 sm:p-6 md:p-8">
      <Button 
        variant="ghost" 
        onClick={() => router.back()} 
        className="mb-6 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 transition-colors duration-200"
      >
        <ChevronLeft className="mr-2 h-5 w-5" /> Back
      </Button>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto">
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="Note Title"
              className="text-3xl font-bold bg-transparent border-none focus:ring-0 p-0 mb-4 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          )}
        />
        <div className="flex flex-wrap gap-2 mb-4">
          <FormatButton icon={<Bold />} onClick={() => insertMarkdown('**', 'Bold text')} tooltip="Bold" />
          <FormatButton icon={<Italic />} onClick={() => insertMarkdown('*', 'Italic text')} tooltip="Italic" />
          <FormatButton icon={<List />} onClick={() => insertMarkdown('\n- ', 'List item')} tooltip="List" />
          <FormatButton icon={<Heading />} onClick={() => insertMarkdown('\n# ', 'Heading')} tooltip="Heading" />
          <FormatButton icon={<Code />} onClick={() => insertMarkdown('`', 'Code')} tooltip="Inline Code" />
          <FormatButton icon={<Link />} onClick={() => insertMarkdown('[', 'Link text](https://example.com)')} tooltip="Link" />
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setIsPreview(!isPreview)}
            className="ml-auto bg-white dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors duration-200"
          >
            {isPreview ? <Edit2 className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {isPreview ? 'Edit' : 'Preview'}
          </Button>
        </div>
        {isPreview ? (
          <div className="prose dark:prose-invert max-w-none bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg min-h-[500px] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <ReactMarkdown>{content || ''}</ReactMarkdown>
          </div>
        ) : (
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder="Start writing your note..."
                className="min-h-[500px] text-lg bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg resize-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
            )}
          />
        )}
        <Button type="submit" className="mt-6 w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg">
          Save Note
        </Button>
      </form>
    </div>
  );
}

interface FormatButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  tooltip: string;
}

const FormatButton: React.FC<FormatButtonProps> = ({ icon, onClick, tooltip }) => (
  <Button
    type="button"
    variant="outline"
    onClick={onClick}
    className="bg-white dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors duration-200 group relative"
  >
    {icon}
    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
      {tooltip}
    </span>
  </Button>
);