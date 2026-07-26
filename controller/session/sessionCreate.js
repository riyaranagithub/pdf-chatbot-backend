import { v4 as uuidv4 } from "uuid";
import Session from "../../models/sessionSchema.js";

export const sessionCreate = async (req, res) => {
  try {
    console.log("request for session creare...")
    console.log(req.body)
    const { user_email, pdf_id, title } = req.body;


    if (!user_email) {
      return res.status(400).json({ error: "User email is required" });
    }
    if (!pdf_id) {
      return res.status(400).json({ error: "Pdf id is required" });
    }

    const existingSession = await Session.findOne({
      user_email: user_email,
      pdf_id: pdf_id,
      title: title
    });

    if (existingSession) {
      return res.status(400).json({
        message: `${title} session already exists.`
      });
    }


    const session_id = uuidv4();

    const newSession = await Session.create({
      session_id,
      user_email,
      pdf_id,
      title: title || "New Chat"
    });

    res.status(201).json(newSession);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};