import { notesIndex } from "@/lib/db/pinecone";
import prisma from "@/lib/db/prisma";
import { getEmbedding } from "@/lib/gemini";
import { auth } from "@clerk/nextjs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from "ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_SECRET_KEY || "");

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Truncate the messages to the last 6
    const messagesTruncated = messages.slice(-14);

    // Generate the embedding for the truncated messages
    const embedding = await getEmbedding(
      messagesTruncated.map((message: Message) => message.content).join("\n"),
    );

    // Get the user ID
    const { userId } = auth();

    // Query the Pinecone index with the generated embedding
    const vectorQueryResponse = await notesIndex.query({
      vector: embedding,
      topK: 4,
      filter: { userId },
    });

    // Find the relevant notes in the database
    const relevantNotes = await prisma.note.findMany({
      where: {
        id: {
          in: vectorQueryResponse.matches.map((match) => match.id),
        },
      },
    });

    const systemMessage = `
I'm nineAI, an intelligent note-taking app. I provide detailed answers your questions based on your existing notes.. I can:

- Take notes and summarize information you provide
- Answer questions based on your existing notes 
- Make logical inferences to fill in gaps in your notes
- Ask clarifying questions if I need more information
- Provide additional context or details related to your notes
- Suggest related topics that may be useful to add to your notes
- Check for factual accuracy and admit when I don't know something
- Continuously learn from our conversation to improve my capabilities
- Perform web searches to find relevant information not contained in your notes
- Analyze search results to extract key facts and summaries
- Integrate new information from searches into your knowledge base

If asked a question that is not covered in your notes, perform a web search to find relevant information from other sources

The notes relevant to your current query are:

${relevantNotes
  .map(
    (note) => `
  Title: ${note.title}
  
  Content:
  ${note.content}
`,
  )
  .join("\n")}
`;

    console.log(systemMessage);

    const userMessages = messagesTruncated.map((message: Message) => ({
      role: message.role == "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));

    const contents = [
      ...userMessages,
      { role: "model", parts: [{ text: systemMessage }] },
      { role: "user", parts: [{ text: "." }] }, // Dummy user message
    ];

    console.log("my contents: ", contents);

    const geminiStream = await genAI
      .getGenerativeModel({ model: "gemini-pro" })
      .generateContentStream({
        contents: contents,
      });

    const stream = GoogleGenerativeAIStream(geminiStream);

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("An error occurred:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
