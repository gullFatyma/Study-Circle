import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Reply content is required"],
    },
    fileUrl: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["public", "private"],
      required: true,
    },
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: true,
    },
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Sirf tab set hoga jab type === "private" — kis ko personal reply mila
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

replySchema.index({ request: 1, type: 1, createdAt: 1 });

const Reply = mongoose.model("Reply", replySchema);
export default Reply;