import { Database } from "@/lib/database.types";
import { notesIndex } from "@/lib/db/pinecone";
import prisma from "@/lib/db/prisma";
import { getEmbedding } from "@/lib/gemini";
import { createNoteSchema, deleteNoteSchema, updateNoteSchema } from "@/lib/validation/note";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers'


export async function GET(req: Request) {
    try {
        const supabase = createServerComponentClient<Database>({ cookies })
        const { data: { session } } = await supabase.auth.getSession()
        const userId = session?.user?.id;
        
        if (!userId) {
            return Response.json({ error: "Unauthorized" }, { status: 401 })
        }

        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const [notes, totalCount] = await prisma.$transaction([
            prisma.note.findMany({
                where: { userId },
                orderBy: { updatedAt: 'desc' },
                take: limit,
                skip: skip,
                cacheStrategy: {
                    ttl: 60,
                    swr: 60
                }
            }),
            prisma.note.count({
                where: { userId },
                cacheStrategy: {
                    ttl: 300,
                    swr: 60
                }
            })
        ]);

        return Response.json({
            notes,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalCount
        });
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parseResult = createNoteSchema.safeParse(body);

        if (!parseResult.success) {
            console.error(parseResult.error);
            return Response.json({ error: "Invalid input" }, { status: 400 });
        }

        const { title, content } = parseResult.data;

        const supabase = createServerComponentClient<Database>({ cookies });
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (!userId) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Create the note first
        const note = await prisma.note.create({
            data: {
                title,
                content,
                userId,
            },
        });

        // Handle the background tasks
        setImmediate(async () => {
            try {
                console.log("Generating embedding for note (POST)");
                const embedding = await getEmbeddingForNote(title, content);
                console.log("Embedding generated (POST)")
                console.log("Upserting embedding to Pinecone (POST)");
                await notesIndex.upsert([
                    {
                        id: note.id,
                        values: embedding,
                        metadata: { userId }
                    }
                ]);
                console.log("Embedding upserted (POST)")
            } catch (embeddingError) {
                console.error("Failed to generate or upsert embedding:", embeddingError);
            }
        });

        return Response.json({ note }, { status: 201 });
    } catch (error) {
        console.error("Error in POST /api/notes:", error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const parseResult = updateNoteSchema.safeParse(body);

        if (!parseResult.success) {
            console.error(parseResult.error);
            return Response.json({ error: "Invalid input" }, { status: 400 });
        }

        const { id, title, content } = parseResult.data;

        const supabase = createServerComponentClient<Database>({ cookies });
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        const note = await prisma.note.findUnique({ where: { id } });

        if (!note) {
            return Response.json({ error: "Note not found" }, { status: 404 });
        }

        if (!userId || userId !== note.userId) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Update the note first
        const updatedNote = await prisma.note.update({
            where: { id },
            data: {
                title,
                content,
            }
        });

        // Handle the background tasks
        setImmediate(async () => {
            try {
                console.log("Generating embedding for note (PUT)");
                const embedding = await getEmbeddingForNote(title, content);
                console.log("Embedding generated (PUT)")
                console.log("Upserting embedding to Pinecone (PUT)");
                await notesIndex.upsert([
                    {
                        id,
                        values: embedding,
                        metadata: { userId }
                    }
                ]);
                console.log("Embedding Upserted (PUT)")
            } catch (embeddingError) {
                console.error("Failed to generate or upsert embedding:", embeddingError);
            }
        });

        return Response.json({ updatedNote }, { status: 200 });
    } catch (error) {
        console.error("Error in PUT /api/notes:", error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const body = await req.json();
        const parseResult = deleteNoteSchema.safeParse(body);

        if (!parseResult.success) {
            console.error(parseResult.error);
            return Response.json({ error: "Invalid input" }, { status: 400 });
        }

        const { id } = parseResult.data;

        const supabase = createServerComponentClient<Database>({ cookies });
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        const note = await prisma.note.findUnique({ where: { id } });

        if (!note) {
            return Response.json({ error: "Note not found" }, { status: 404 });
        }

        if (!userId || userId !== note.userId) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Delete the note from the database first
        await prisma.note.delete({ where: { id } });

        // Handle the background task
        setImmediate(async () => {
            try {
                console.log("Deleting note from Pinecone");
                await notesIndex.deleteOne(id);
                console.log("Note deleted")
            } catch (pineconeError) {
                console.error("Failed to delete note from Pinecone:", pineconeError);
            }
        });

        return Response.json({ message: "Note deleted" }, { status: 200 });
    } catch (error) {
        console.error("Error in DELETE /api/notes:", error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}

async function getEmbeddingForNote(title: string, content: string | undefined) {
    return getEmbedding(title + "\n\n" + content ?? "");
}