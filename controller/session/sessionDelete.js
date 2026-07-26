import Chat from "../../models/chatSchema.js";
import Session from "../../models/sessionSchema.js";

export const sessionDelete = async (req, res) => {
  try {
    console.log("request to delete session...")
    const { session_id } = req.params;
    const { user_email } = req.body;

    // 🔒 Security check
    const session = await Session.findOne({ session_id, user_email });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Delete session
    await Session.deleteOne({ session_id });

    // Delete all chats of this session
    await Chat.deleteMany({ session_id });

    res.status(200).json({
      message: "Session deleted successfully",
      session_id: session_id,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};