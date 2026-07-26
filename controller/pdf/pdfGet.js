import express from "express";
import pdfSchema from "../../models/pdfSchema.js";
// GET PDFs by user email
export const pdfGet= async (req, res) => {
  try {
    const { user_email } = req.body;

    if (!user_email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const pdfs = await pdfSchema
      .find({ user_email: user_email })
      .select({
        file_name: 1,
        pdf_url:1,
        pdf_id:1,
        user_email:1
      });

    res.json({"pdfs": pdfs , "message": "PDFs retrieved successfully"});
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export default pdfGet;