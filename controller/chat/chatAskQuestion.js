import Chat from "../../models/chatSchema.js";
import Session from "../../models/sessionSchema.js";
import { chromaStore } from "../../utils/cromaStore.js";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
});

export const chatAskQuestion = async (req, res) => {
    try {
        const { user_email, session_id, pdf_id, question } = req.body;

        if (!user_email || !session_id || !pdf_id || !question) {
            return res.status(400).json({ error: "Missing fields" });
        }

        // =========================
        // 💾 1. Save USER message
        // =========================
        await Chat.create({
            session_id,
            user_email,
            pdf_id,
            role: "user",
            message: question,
        });

        // =========================
        // 🧠 2. Get chat history
        // =========================
        const history = await Chat.find({ session_id })
            .sort({ created_at: -1 })
            .limit(6);

        const chatHistory = history
            .reverse()
            .map((msg) => `${msg.role}: ${msg.message}`)
            .join("\n");


            // console.log("chatHistory :",chatHistory)
        // =========================
        // 🔍 3. Retrieve from Chroma
        // =========================
        const retriever = chromaStore.asRetriever({
            k: 8,
            filter: { pdf_id }, // 🔥 important
        });



        const docs = await retriever.invoke(question);

        const context = docs.map((d) => d.pageContent).join("\n\n");
        console.log("Retrieved context:", context);

        // =========================
        // 🧠 4. LLM Prompt
        // =========================
        const prompt = new PromptTemplate({
            template: `You are a PDF assistant.  
            Context: ${context}
            Chat History: ${chatHistory}
            Question: ${question}

            Answer clearly. If not in context, say "Not found in document".`,
            inputVariables: ["context", "question","chatHistory"],
        })

         // 🔗 chain
            const chain = prompt.pipe(model).pipe(new StringOutputParser());
        
            // 🤖 response
            const result = await chain.invoke({
              context,
              question,
              chatHistory
            });

            console.log("result from model : ",result)


        // =========================
        // 💾 5. Save ASSISTANT message
        // =========================
       const response =  await Chat.create({
             
            session_id,
            user_email,
            pdf_id,
            role: "assistant",
            message: result,
        });

        // =========================
        // 🧠 6. Auto title update
        // =========================
        const count = await Chat.countDocuments({ session_id });

        if (count <= 2) {
            await Session.updateOne(
                { session_id },
                { title: question.slice(0, 50) }
            );
        }

        // =========================
        // ✅ RESPONSE
        // =========================
        res.status(200).json(response);

    } catch (err) {
        console.error("❌ Ask error:", err);
        res.status(500).json({ error: err.message });
    }
};