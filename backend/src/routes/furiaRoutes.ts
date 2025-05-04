import { Router } from "express";
import { messageController } from "../controllers/messageController";

const router = Router();

router.post("/message", messageController.send)
router.get("/message", messageController.getConversation)

export default router;
