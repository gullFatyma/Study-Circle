import express from "express";
import {
  createReply,
  getPublicReplies,
  getPrivateReplies,
} from "../controllers/replyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createReply);
router.get("/private/:requestId", protect, getPrivateReplies);
router.get("/:requestId", getPublicReplies);

export default router;