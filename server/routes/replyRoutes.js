import express from "express";
import {
  createReply,
  getPublicReplies,
  getPrivateReplies,
} from "../controllers/replyController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", protect, upload.single("file"), createReply);
router.get("/private/:requestId", protect, getPrivateReplies);
router.get("/:requestId", getPublicReplies);

export default router;