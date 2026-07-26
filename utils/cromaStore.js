import { Chroma } from "@langchain/community/vectorstores/chroma";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import "dotenv/config";

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001",
});

export const chromaStore = await Chroma.fromExistingCollection(embeddings, {
  collectionName: "pdfs",

  // 🔐 API Key
  chromaCloudAPIKey: process.env.CHROMA_API_KEY,

  // 🌐 Cloud connection
  clientParams: {
    host: "api.trychroma.com",
    port: 8000,
    ssl: true,
    tenant: process.env.CHROMA_TENANT,
    database: process.env.CHROMA_DATABASE,
  },
});