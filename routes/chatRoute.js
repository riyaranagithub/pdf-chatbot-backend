import { Router } from "express";
import { chatAskQuestion } from "../controller/chat/chatAskQuestion.js";
import { chatGetMessages } from "../controller/chat/chatGetMessages.js";

const chatRouter = Router();

chatRouter.get("/messages", chatGetMessages);
chatRouter.post("/ask", chatAskQuestion);

export default chatRouter;