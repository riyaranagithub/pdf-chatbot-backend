import { Router } from "express";
import Pdf from "../../models/pdfSchema.js";
import fs from "fs";
import path from "path";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { chromaStore } from "../../utils/cromaStore.js";
import { v4 as uuidv4 } from "uuid";
import cloudinary from "../../utils/cloudinary_config.js";



export const pdfUpload = async (req, res) => {
  console.log("📥 Upload request received");
  console.log("BODY:", req.body);

  try {
    const { user_email } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!user_email) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    const existingFile = await Pdf.findOne({
      user_email: user_email,
      file_name: req.file.originalname
    });

    if (existingFile) {
      return res.status(400).json({
        message: `${req.file.originalname} already exists.`
      });
    }


    // 📁 Create uploads folder
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log("📁 Uploads folder created");
    }

    const filePath = path.join(uploadsDir, req.file.originalname);

    // 💾 Save file
    fs.writeFileSync(filePath, req.file.buffer);
    console.log("✅ File saved at:", filePath);

    // convert buffer to base64
    const base64 = req.file.buffer.toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${base64}`;

    const cloudinaryResponse = await cloudinary.uploader.upload(dataURI, {
      folder: "pdf_uploads",
      resource_type: "raw",   // 👈 FIX
      type: "upload",
    });

    if (!cloudinaryResponse.secure_url) {
      return res.status(500).json({ error: "Upload failed: No URL returned" });
    }



    // 📖 Load PDF

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(req.file.buffer),
    });

    const pdf = await loadingTask.promise;

    let text = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      text += textContent.items
        .map(item => ("str" in item ? item.str : ""))
        .join(" ");

      text += "\n";
    }
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 800,
      chunkOverlap: 150,
    });

    const docs = await splitter.createDocuments([text]);

    console.log("PDF text length:", text.length);
    console.log("First 500 characters:");
    console.log(text.substring(0, 500));

    console.log("Chunks:", docs.length);

    // 🧠 Create embeddings
    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: "gemini-embedding-2-preview",
    });

    // 🧹 Remove empty chunks
    const cleanDocs = docs.filter(
      (doc) => doc.pageContent && doc.pageContent.trim().length > 0
    );


    // 🏷️ Add metadata properly

    const pdf_id = uuidv4(); // Generate unique PDF ID

    const docsWithMetadata = cleanDocs.map((doc) => ({
      pageContent: doc.pageContent,
      metadata: {
        source: doc.metadata.source || "",
        page: doc.metadata.loc?.pageNumber || 0, // flatten
        user_email,
        file_name: req.file.originalname,
        pdf_id: pdf_id, // Add PDF ID to metadata
        pdf_url: cloudinaryResponse.secure_url

      },
    }));

    console.log("🏷️ Metadata added to chunks. Sample metadata:", docsWithMetadata[0]);

    if (!docsWithMetadata.length) {
      throw new Error("❌ No documents to store in Chroma");
    }

    // Vector store in Chroma
    console.log("🚀 Storing data in Chroma...");
    await chromaStore.addDocuments(docsWithMetadata);
    console.log("✅ Stored successfully in Chroma");

    //get document in chroma


    // 💾 Save in MongoDB
    const newUpload = new Pdf({
      user_email,
      pdf_id,
      file_name: req.file.originalname,
      pdf_url: cloudinaryResponse.secure_url,
      size_bytes: req.file.size,
    });

    await newUpload.save();
    console.log("🗄️ Saved to MongoDB");


    // 🧹 Delete temp file
    fs.unlinkSync(filePath);
    console.log("🗑️ Temp file deleted");

    // ✅ Response
    res.status(200).json({
      message: "File uploaded successfully 🚀",
      pdf: {
        file_name: req.file.originalname,
        pdf_url: cloudinaryResponse.secure_url,
        _id: newUpload._id,
        user_email: user_email,
        pdf_id: pdf_id
      },
    });

  } catch (error) {
    console.error("❌ Upload error:", error);

    res.status(500).json({
      error: "File upload failed",
      details: error.message || "Unknown server error",
    });
  }
};
