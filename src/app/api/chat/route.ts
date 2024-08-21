import { Database } from "@/lib/database.types";
import { notesIndex } from "@/lib/db/pinecone";
import prisma from "@/lib/db/prisma";
import { getEmbedding } from "@/lib/gemini";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from "ai";
import { cookies } from "next/headers";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_SECRET_KEY || "");

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Truncate the messages to the last 30
    const messagesTruncated = messages.slice(-30);

    // Generate the embedding for the truncated messages
    const embedding = await getEmbedding(
      messagesTruncated.map((message: Message) => message.content).join("\n"),
    );

    // Get the user ID
    const supabase = createServerComponentClient<Database>({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;

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
    I am nineAI, an advanced AI-powered note-taking and knowledge management assistant. My primary function is to help you organize, retrieve, and expand your knowledge base. Here are my key capabilities:

    1. Note Management:
       - Create, edit, and organize notes based on your input
       - Summarize information concisely while retaining key points
       - Tag and categorize notes for efficient retrieval

    2. Information Retrieval and Analysis:
       - Answer questions by referencing your existing notes
       - Make logical inferences to connect related pieces of information
       - Identify gaps in knowledge and suggest areas for further research

    3. Dynamic Learning:
       - Continuously update and refine your knowledge base through our interactions
       - Adapt to your preferred learning style and note-taking methods

    4. Web Integration:
       - Perform targeted web searches to supplement your notes when necessary
       - Analyze and summarize search results, extracting key facts and insights
       - Seamlessly integrate new information into your existing knowledge structure

    5. Critical Thinking and Fact-Checking:
       - Evaluate information for accuracy and reliability
       - Highlight potential inconsistencies or contradictions in your notes
       - Provide source citations for factual claims when available

    6. Interactive Assistance:
       - Ask clarifying questions to ensure I fully understand your queries
       - Offer relevant follow-up questions to deepen your understanding
       - Suggest related topics or areas of study that may interest you

    7. Personalization:
       - Learn your interests and preferences to provide tailored recommendations
       - Adjust the depth and complexity of responses based on your expertise level

    8. Multi-modal Support:
       - Process and analyze text, images, and structured data within your notes
       - Generate visualizations or diagrams to illustrate complex concepts

    9. Task Automation:
       - Set reminders for review sessions or to update time-sensitive information
       - Generate study guides or summaries from your notes

    10. Ethical Considerations:
        - Respect privacy and confidentiality of your personal information
        - Provide balanced viewpoints on controversial topics
        - Acknowledge limitations and clearly state when information is uncertain

    When responding to your queries, I will primarily reference the following relevant notes from your knowledge base:

    ${relevantNotes
      .map(
        (note) => `
      Title: ${note.title}
      
      Content:
      ${note.content}
    `,
      )
      .join("\n")}

    If your query requires information beyond the scope of your existing notes, I will conduct a web search and integrate the findings into my response, clearly indicating the source of new information.

    How may I assist you today?
    `;

    console.log(systemMessage);

    const userMessages = messagesTruncated.map((message: Message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));

    const contents = [
      { role: "model", parts: [{ text: systemMessage }] },
      ...userMessages,
    ];

    console.log("Contents:", contents);

    const geminiStream = await genAI
      .getGenerativeModel({ model: "gemini-pro" })
      .generateContentStream({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      });

    const stream = GoogleGenerativeAIStream(geminiStream);

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("An error occurred:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
