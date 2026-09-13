import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    subject: {
      type: String,
      required: [true, "Subject/tag is required"],
      trim: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
// Indexing the subject field for faster search queries
requestSchema.index({ subject: 1, createdAt: -1 });

const Request = mongoose.model("Request", requestSchema);
export default Request;