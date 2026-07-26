import { Router } from "express";
import Pdf from "../../models/pdfSchema.js"
import Chat from "../../models/chatSchema.js";
import Session from "../../models/sessionSchema.js";
import { chromaStore } from "../../utils/cromaStore.js";

export const pdfDelete = async (req, res) => {
  const { pdf_id } = req.params;
  const { user_email } = req.body;

  try {
    console.log("🗑️ Delete request for PDF:", pdf_id);
    console.log("🗑️ Delete request for email:", user_email);

    // 🔒 Safety check
    const pdf = await Pdf.findOne({ pdf_id, user_email });

    if (!pdf) {
      return res.status(404).json({ error: "PDF not found or unauthorized" });
    }

    // =========================
    // 🧠 1. DELETE FROM CHROMA
    // =========================

    console.log("🚀 Deleting from Chroma...");

    // Option A: delete via metadata (if supported)
    try {
    
     await chromaStore.delete({
        filter: { pdf_id: pdf_id }
  });

      console.log("✅ Deleted from Chroma using metadata");
    } catch (err) {
      
      console.log("Delete failed in chroma",err);
      return;

    }

    // =========================
    // 🗄️ 2. DELETE FROM MONGODB
    // =========================

    await Pdf.deleteOne({ pdf_id: pdf_id });

    // Optional (if using chat system)
    await Chat.deleteMany({ pdf_id });
    await Session.deleteMany({ pdf_id });

    console.log("🗄️ Deleted from MongoDB");

    // =========================
    // ✅ RESPONSE
    // =========================

    res.status(200).json({
      message: "PDF deleted successfully 🚀",
    });

  } catch (error) {
    console.error("❌ Delete error:", error);

    res.status(500).json({
      error: "Failed to delete PDF",
      details: error.message,
    });
  }
};

