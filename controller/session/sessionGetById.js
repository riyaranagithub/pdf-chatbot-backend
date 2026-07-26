import Session from "../../models/sessionSchema.js"

export const sessionGetById = async (req, res) => {
  try {
    const { session_id } = req.params;

    const session = await Session.findOne({ session_id });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.status(200).json(session);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};