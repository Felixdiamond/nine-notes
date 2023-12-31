import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_SECRET_KEY;

if(!apiKey) {
    throw Error("GOOGLE_SECRET_KEY is not set")
}

const genAI = new GoogleGenerativeAI(apiKey);

export default genAI;

export async function getEmbedding(text: string) {
    const model = genAI.getGenerativeModel({ model: "embedding-001" })
    const response = await model.embedContent(text);
    const embedding = response.embedding.values;
    if (!embedding) throw Error("Error generating embedding")
    return embedding;
}
