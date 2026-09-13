import Reply from "../models/Reply.js";
import Request from "../models/Request.js";

// Create a reply (public or private) to a request
// @route   POST /api/replies
export const createReply = async (req, res) => {
  try {
    const { requestId, content, fileUrl, type } = req.body;

    if (!requestId || !content || !type) {
      return res.status(400).json({ message: "requestId, content and type are required" });
    }

    if (!["public", "private"].includes(type)) {
      return res.status(400).json({ message: "type must be 'public' or 'private'" });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const reply = await Reply.create({
      content,
      fileUrl,
      type,
      request: requestId,
      repliedBy: req.user._id,
      recipient: type === "private" ? request.postedBy : null,
    });

    const populatedReply = await reply.populate("repliedBy", "name email");

    res.status(201).json(populatedReply);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Get all public replies for a request
// @route   GET /api/replies/:requestId
export const getPublicReplies = async (req, res) => {
  try {
    const replies = await Reply.find({
      request: req.params.requestId,
      type: "public",
    })
      .populate("repliedBy", "name email")
      .sort({ createdAt: 1 });

    res.json(replies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Get private replies for a request (only the original poster can see them)
// @route   GET /api/replies/private/:requestId
export const getPrivateReplies = async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view these replies" });
    }

    const replies = await Reply.find({
      request: req.params.requestId,
      type: "private",
    })
      .populate("repliedBy", "name email")
      .sort({ createdAt: 1 });

    res.json(replies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};