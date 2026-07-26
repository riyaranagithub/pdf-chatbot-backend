// models/pdfSchema.js
import mongoose from "mongoose";

const pdfSchema = new mongoose.Schema(
  {
    pdf_id:{
      type:String,
      required:true
    },
    user_email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    file_name: {
      type: String,
      required: true,
    },

    pdf_url:{
      type: String,
      required: true,
    },

    size_bytes: {
      type: Number,
      required: true,
    },
    uploaded_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "uploaded_pdfs", // optional: set collection name
  }
);

// Avoid recompiling model if already exists
export default mongoose.models.pdfSchema || mongoose.model("Pdf", pdfSchema);