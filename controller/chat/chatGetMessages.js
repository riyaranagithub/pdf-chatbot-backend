import Chat from "../../models/chatSchema.js";
export const chatGetMessages = async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ error: "session_id required" });
    }

    const messages = await Chat.find({ session_id })
      .sort({ created_at: 1 });

    res.status(200).json(messages);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};