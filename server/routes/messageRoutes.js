import express from "express";

import {
  startConversation,
  getConversations,
  getUnreadCount,
  getMessages,
  sendMessage,
} from "../controllers/messageController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Logged-in user ki conversation list
router.get(
  "/",
  protect,
  getConversations
);

// Navbar ke liye total unread count
// Is route ko /:conversationId se pehle rakhna zaroori hai
router.get(
  "/unread-count",
  protect,
  getUnreadCount
);

// Request se new private conversation
router.post(
  "/",
  protect,
  upload.single("file"),
  startConversation
);

// Particular conversation ke messages
router.get(
  "/:conversationId",
  protect,
  getMessages
);

// Existing conversation mein new message
router.post(
  "/:conversationId",
  protect,
  upload.single("file"),
  sendMessage
);

export default router;