import { Router } from "express";
import { ChatControllers } from "./chat.controller";
import { auth } from "../../middleware/auth";

const router = Router();

// Retrieve all conversation rooms and partner summaries
router.get("/rooms", auth(), ChatControllers.getChatRooms);

// Retrieve full chat log history with a specific partner
router.get("/history/:partnerId", auth(), ChatControllers.getMessageHistory);

// Send a new message (Fallback for when Socket.IO is disabled)
router.post("/send", auth(), ChatControllers.sendMessage);

export const ChatRoutes = router;
export default ChatRoutes;
