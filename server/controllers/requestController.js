import mongoose from "mongoose";
import Request from "../models/Request.js";
import Reply from "../models/Reply.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import cloudinary from "../config/cloudinary.js";

const getCloudinaryAsset = (fileUrl) => {
  if (!fileUrl) return null;

  let pathname;
  try {
    const url = new URL(fileUrl);
    if (url.hostname !== "res.cloudinary.com") return null;
    pathname = url.pathname;
  } catch {
    return null;
  }

  const uploadIndex = pathname.indexOf("/upload/");
  if (uploadIndex === -1) return null;

  const resourceType = pathname
    .slice(0, uploadIndex)
    .split("/")
    .filter(Boolean)
    .at(-1);

  if (!["image", "video", "raw"].includes(resourceType)) {
    return null;
  }

  const pathParts = pathname
    .slice(uploadIndex + "/upload/".length)
    .split("/")
    .filter(Boolean);

  if (/^v\d+$/.test(pathParts[0] || "")) {
    pathParts.shift();
  }

  if (resourceType !== "raw" && pathParts.length > 0) {
    pathParts[pathParts.length - 1] =
      pathParts[pathParts.length - 1].replace(/\.[^.]+$/, "");
  }

  if (pathParts.length === 0) return null;

  return {
    publicId: pathParts.join("/"),
    resourceType,
  };
};

// Create a new request
// @route   POST /api/requests
export const createRequest = async (req, res) => {
  try {
    const { title, description, subject } = req.body;

    if (!title || !subject) {
      return res.status(400).json({ message: "Title and subject are required" });
    }

    const request = await Request.create({
      title,
      description,
      subject,
      postedBy: req.user._id,
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Get all requests (feed) - optional subject filter
// @route   GET /api/requests?subject=OOP
export const getRequests = async (req, res) => {
  try {
    const filter = {};
    if (req.query.subject) {
      filter.subject = req.query.subject;
    }

    const requests = await Request.find(filter)
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single request by ID
// @route   GET /api/requests/:id
export const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate("postedBy", "name email");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Delete own request
// @route   DELETE /api/requests/:id
export const deleteRequest = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Request not found" });
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this request" });
    }

    const conversations = await Conversation.find({
      request: request._id,
    }).select("_id");
    const conversationIds = conversations.map(
      (conversation) => conversation._id
    );

    const [replies, messages] = await Promise.all([
      Reply.find({ request: request._id }).select("fileUrl"),
      Message.find({
        conversation: { $in: conversationIds },
      }).select("fileUrl"),
    ]);

    const assets = new Map();
    [...replies, ...messages].forEach(({ fileUrl }) => {
      const asset = getCloudinaryAsset(fileUrl);
      if (asset) {
        assets.set(
          `${asset.resourceType}:${asset.publicId}`,
          asset
        );
      }
    });

    await Promise.all(
      [...assets.values()].map(({ publicId, resourceType }) =>
        cloudinary.uploader.destroy(publicId, {
          resource_type: resourceType,
        })
      )
    );

    await Reply.deleteMany({ request: request._id });
    await Message.deleteMany({
      conversation: { $in: conversationIds },
    });
    await Conversation.deleteMany({ request: request._id });
    await request.deleteOne();
    res.json({ success: true, message: "Request deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};