import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Request from "../models/Request.js";
import Reply from "../models/Reply.js";

import { getIO } from "../socket.js";

const populateConversation = (query) =>
  query
    .populate(
      "participants",
      "name email avatarUrl"
    )
    .populate(
      "request",
      "title subject postedBy"
    )
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "name",
      },
    });

const populateMessage = async (message) => {
  await message.populate([
    {
      path: "sender",
      select: "name email avatarUrl",
    },
    {
      path: "recipient",
      select: "name email avatarUrl",
    },
  ]);

  return message;
};

// POST /api/messages
// Request se private conversation start karna
export const startConversation = async (
  req,
  res
) => {
  try {
    const { requestId, content } = req.body;

    if (!requestId || !content?.trim()) {
      return res.status(400).json({
        message:
          "Request and message are required",
      });
    }

    const request =
      await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (
      request.postedBy.toString() ===
      req.user._id.toString()
    ) {
      return res.status(400).json({
        message:
          "You cannot start a chat with yourself",
      });
    }

    let conversation =
      await Conversation.findOne({
        request: requestId,

        participants: {
          $all: [
            req.user._id,
            request.postedBy,
          ],

          $size: 2,
        },
      });

    if (!conversation) {
      conversation =
        await Conversation.create({
          request: requestId,

          participants: [
            req.user._id,
            request.postedBy,
          ],
        });
    }

    let message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      recipient: request.postedBy,
      content: content.trim(),
      fileUrl: req.file?.path || "",
    });

    conversation.lastMessage = message._id;
    await conversation.save();

    message = await populateMessage(message);

    // Gull ko real-time new message event bhejo
    getIO()
      .to(
        `user:${request.postedBy.toString()}`
      )
      .emit("message:new", {
        conversationId:
          conversation._id.toString(),

        message,
      });

    res.status(201).json({
      message:
        "Private message sent successfully",

      conversationId: conversation._id,

      sentMessage: message,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET /api/messages
// Logged-in user ki conversations
export const getConversations = async (
  req,
  res
) => {
  try {
    /*
      Purane private replies ko Messages
      collection mein transfer karna.
    */
    const legacyReplies = await Reply.find({
      type: "private",

      $or: [
        { repliedBy: req.user._id },
        { recipient: req.user._id },
      ],
    }).sort({ createdAt: 1 });

    for (const legacy of legacyReplies) {
      const alreadyMigrated =
        await Message.exists({
          legacyReply: legacy._id,
        });

      if (alreadyMigrated) continue;

      let legacyConversation =
        await Conversation.findOne({
          request: legacy.request,

          participants: {
            $all: [
              legacy.repliedBy,
              legacy.recipient,
            ],

            $size: 2,
          },
        });

      if (!legacyConversation) {
        legacyConversation =
          await Conversation.create({
            request: legacy.request,

            participants: [
              legacy.repliedBy,
              legacy.recipient,
            ],
          });
      }

      const migratedMessage =
        await Message.create({
          conversation:
            legacyConversation._id,

          sender: legacy.repliedBy,
          recipient: legacy.recipient,
          content: legacy.content,
          fileUrl: legacy.fileUrl,

          legacyReply: legacy._id,

          createdAt: legacy.createdAt,
          updatedAt: legacy.updatedAt,
        });

      legacyConversation.lastMessage =
        migratedMessage._id;

      await legacyConversation.save();
    }

    const conversations =
      await populateConversation(
        Conversation.find({
          participants: req.user._id,
        }).sort({ updatedAt: -1 })
      );

    /*
      Har conversation ka separate
      unread count calculate karna.
    */
    const conversationIds =
      conversations.map(
        (conversation) =>
          conversation._id
      );

    const unreadResults =
      await Message.aggregate([
        {
          $match: {
            conversation: {
              $in: conversationIds,
            },

            recipient: req.user._id,

            read: false,
          },
        },

        {
          $group: {
            _id: "$conversation",
            count: { $sum: 1 },
          },
        },
      ]);

    const unreadMap = {};

    unreadResults.forEach((item) => {
      unreadMap[item._id.toString()] =
        item.count;
    });

    const result = conversations.map(
      (conversation) => ({
        ...conversation.toObject(),

        unreadCount:
          unreadMap[
            conversation._id.toString()
          ] || 0,
      })
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET /api/messages/unread-count
// Navbar ke liye total unread messages
export const getUnreadCount = async (
  req,
  res
) => {
  try {
    const unreadCount =
      await Message.countDocuments({
        recipient: req.user._id,
        read: false,
      });

    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET /api/messages/:conversationId
// Particular conversation ke messages
export const getMessages = async (
  req,
  res
) => {
  try {
    const conversation =
      await populateConversation(
        Conversation.findOne({
          _id: req.params.conversationId,

          participants: req.user._id,
        })
      );

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    const messages = await Message.find({
      conversation: conversation._id,
    })
      .populate(
        "sender",
        "name email avatarUrl"
      )
      .populate(
        "recipient",
        "name email avatarUrl"
      )
      .sort({ createdAt: 1 });

    const readResult =
      await Message.updateMany(
        {
          conversation: conversation._id,

          recipient: req.user._id,

          read: false,
        },

        {
          $set: {
            read: true,
          },
        }
      );

    /*
      Current user ko received messages response
      mein bhi read: true milenge.
    */
    messages.forEach((message) => {
      if (
        message.recipient?._id.toString() ===
        req.user._id.toString()
      ) {
        message.read = true;
      }
    });

    /*
      Agar messages read hue hain to sender ko
      real-time read receipt bhejna.
    */
    if (readResult.modifiedCount > 0) {
      const otherUser =
        conversation.participants.find(
          (participant) =>
            participant._id.toString() !==
            req.user._id.toString()
        );

      if (otherUser) {
        getIO()
          .to(
            `user:${otherUser._id.toString()}`
          )
          .emit("messages:read", {
            conversationId:
              conversation._id.toString(),

            readBy:
              req.user._id.toString(),
          });
      }
    }

    res.json({
      conversation,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// POST /api/messages/:conversationId
// Existing conversation mein message send karna
export const sendMessage = async (
  req,
  res
) => {
  try {
    const conversation =
      await Conversation.findOne({
        _id: req.params.conversationId,

        participants: req.user._id,
      });

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    const content = req.body.content?.trim();

    if (!content) {
      return res.status(400).json({
        message: "Message cannot be empty",
      });
    }

    const recipient =
      conversation.participants.find(
        (participant) =>
          participant.toString() !==
          req.user._id.toString()
      );

    let message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      recipient,
      content,
      fileUrl: req.file?.path || "",
    });

    conversation.lastMessage = message._id;
    await conversation.save();

    message = await populateMessage(message);

    /*
      Receiver ko message instantly bhejna.
    */
    getIO()
      .to(`user:${recipient.toString()}`)
      .emit("message:new", {
        conversationId:
          conversation._id.toString(),

        message,
      });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};