import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const ReplyBox = ({ requestId, onReplyPosted }) => {
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [type, setType] = useState("public");
  const [posting, setPosting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [conversationId, setConversationId] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setConversationId("");

    if (!content.trim()) {
      setError("Reply cannot be empty");
      return;
    }

    setPosting(true);

    try {
      const formData = new FormData();

      formData.append("requestId", requestId);
      formData.append("content", content);
      formData.append("type", type);

      if (file) {
        formData.append("file", file);
      }

      /*
        Public reply existing replies endpoint par jayega.
        Private reply Messages endpoint par jayega.
      */
      const endpoint =
        type === "private"
          ? "/messages"
          : "/replies";

      const { data } = await api.post(endpoint, formData);

      setContent("");
      setFile(null);

      const fileInput = document.getElementById(
        `reply-file-${requestId}`
      );

      if (fileInput) {
        fileInput.value = "";
      }

      if (type === "private") {
        setSuccess("Private message sent successfully.");
        setConversationId(data.conversationId || "");
      } else {
        setSuccess("Public reply posted successfully.");
      }

      await onReplyPosted();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setPosting(false);
    }
  };

  return (
    <section className="reply-box">
      <h2>Write a Reply</h2>

      {error && (
        <p className="reply-feedback reply-feedback--error" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="reply-feedback reply-feedback--success" role="status">
          {success}{" "}
          {conversationId && (
            <Link to={`/messages/${conversationId}`}>
              Open private chat
            </Link>
          )}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <textarea
          className="reply-textarea"
          placeholder="Share notes, an answer, or a helpful link..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="reply-file-field">
          <label htmlFor={`reply-file-${requestId}`}>
            Attach a file (PDF, image, doc — optional):
          </label>

          <input
            id={`reply-file-${requestId}`}
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={(e) =>
              setFile(e.target.files[0] || null)
            }
          />
        </div>

        <div className="reply-visibility-options">
          <label>
            <input
              type="radio"
              name="replyType"
              value="public"
              checked={type === "public"}
              onChange={(e) =>
                setType(e.target.value)
              }
            />{" "}
            Public Reply (visible to everyone)
          </label>

          <label>
            <input
              type="radio"
              name="replyType"
              value="private"
              checked={type === "private"}
              onChange={(e) =>
                setType(e.target.value)
              }
            />{" "}
            Private Reply (only to the poster)
          </label>
        </div>

        <button
          type="submit"
          className="reply-submit-button"
          disabled={posting}
        >
          {posting ? "Posting..." : "Send Reply"}
        </button>
      </form>
    </section>
  );
};

export default ReplyBox;
