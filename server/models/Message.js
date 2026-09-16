import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
    },

    fileUrl: {
      type: String,
      default: "",
    },

    read: {
      type: Boolean,
      default: false,
    },

    legacyReply: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reply",
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

messageSchema.index({
  conversation: 1,
  createdAt: 1,
});

const Message = mongoose.model("Message", messageSchema);

export default Message;