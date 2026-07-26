import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  session_id: {
    type: String,
    required: true,
    index: true
  },

  user_email: {
    type: String,
    required: true,
    index: true
  },

  pdf_id: {
    type: String,
    required: true,
    index: true
  },

  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true
  },

  message: {
    type: String,
    required: true
  },



}, {
  timestamps: { createdAt: "created_at", updatedAt: false }
});

export default mongoose.model("Chat", chatSchema);