import {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

const Messages = () => {
  const { conversationId } = useParams();
  const { user, loading: authLoading } =
    useContext(AuthContext);

  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const loadConversations = async () => {
    const { data } = await api.get("/messages");
    setConversations(data);
  };

  const loadThread = async () => {
    if (!conversationId) {
      setConversation(null);
      setMessages([]);
      return;
    }

    try {
      const { data } = await api.get(
        `/messages/${conversationId}`
      );

      setConversation(data.conversation);
      setMessages(data.messages);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load conversation"
      );
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) {
      loadConversations().catch(() => {
        setError("Could not load messages");
      });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadThread();
    }
  }, [conversationId, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const getOtherParticipant = (item) => {
    return item?.participants?.find(
      (participant) => participant._id !== user?._id
    );
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (!content.trim()) {
      setError("Message cannot be empty");
      return;
    }

    setSending(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("content", content);

      if (file) {
        formData.append("file", file);
      }

      const { data } = await api.post(
        `/messages/${conversationId}`,
        formData
      );

      setMessages((currentMessages) => [
        ...currentMessages,
        data,
      ]);

      setContent("");
      setFile(null);

      const fileInput =
        document.getElementById("chat-file");

      if (fileInput) {
        fileInput.value = "";
      }

      await loadConversations();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Message could not be sent"
      );
    } finally {
      setSending(false);
    }
  };

  if (authLoading || !user) {
    return (
      <p style={{ textAlign: "center" }}>
        Loading...
      </p>
    );
  }

  const activeOtherUser =
    getOtherParticipant(conversation);

  return (
    <main
      style={{
        maxWidth: "1000px",
        height: "calc(100vh - 95px)",
        margin: "18px auto",
        padding: "0 16px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "310px minmax(0, 1fr)",
          height: "100%",
          border: "1px solid #ddd",
          borderRadius: "12px",
          overflow: "hidden",
          background: "white",
        }}
      >
        {/* Conversations sidebar */}

        <aside
          style={{
            borderRight: "1px solid #ddd",
            overflowY: "auto",
          }}
        >
          <h2
            style={{
              margin: 0,
              padding: "16px",
              borderBottom: "1px solid #ddd",
            }}
          >
            Messages
          </h2>

          {conversations.length === 0 ? (
            <p
              style={{
                padding: "16px",
                color: "#777",
              }}
            >
              No private conversations yet.
            </p>
          ) : (
            conversations.map((item) => {
              const otherUser =
                getOtherParticipant(item);

              const isActive =
                item._id === conversationId;

              return (
                <Link
                  key={item._id}
                  to={`/messages/${item._id}`}
                  style={{
                    display: "block",
                    padding: "14px",
                    borderBottom: "1px solid #eee",
                    color: "inherit",
                    textDecoration: "none",
                    background: isActive
                      ? "#eef4ff"
                      : "white",
                  }}
                >
                  <strong>
                    {otherUser?.name || "User"}
                  </strong>

                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginTop: "3px",
                    }}
                  >
                    Re: {item.request?.title}
                  </div>

                  <div
                    style={{
                      fontSize: "13px",
                      color: "#888",
                      marginTop: "5px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.lastMessage?.sender?._id ===
                    user._id
                      ? "You: "
                      : ""}

                    {item.lastMessage?.content ||
                      "Start conversation"}
                  </div>
                </Link>
              );
            })
          )}
        </aside>

        {/* Chat section */}

        <section
          style={{
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          {!conversationId ? (
            <div
              style={{
                margin: "auto",
                textAlign: "center",
                color: "#777",
              }}
            >
              <h3>Select a conversation</h3>

              <p>
                Your private messages will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Chat header */}

              <header
                style={{
                  padding: "13px 18px",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <strong>
                  {activeOtherUser?.name ||
                    "Private conversation"}
                </strong>

                <div
                  style={{
                    fontSize: "13px",
                    color: "#666",
                    marginTop: "3px",
                  }}
                >
                  Request:{" "}
                  {conversation?.request?.title}
                </div>
              </header>

              {/* Messages */}

              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "18px",
                  background: "#f7f8fa",
                }}
              >
                {error && (
                  <p style={{ color: "#b91c1c" }}>
                    {error}
                  </p>
                )}

                {messages.map((message) => {
                  const isMine =
                    message.sender?._id === user._id;

                  return (
                    <div
                      key={message._id}
                      style={{
                        display: "flex",
                        justifyContent: isMine
                          ? "flex-end"
                          : "flex-start",
                        marginBottom: "12px",
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "72%",
                          padding: "9px 12px",
                          borderRadius: isMine
                            ? "14px 14px 2px 14px"
                            : "14px 14px 14px 2px",
                          background: isMine
                            ? "#2563eb"
                            : "white",
                          color: isMine
                            ? "white"
                            : "#222",
                          boxShadow:
                            "0 1px 3px rgba(0,0,0,0.1)",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            opacity: 0.75,
                            marginBottom: "3px",
                          }}
                        >
                          {isMine
                            ? `You → ${message.recipient?.name}`
                            : `${message.sender?.name} → You`}
                        </div>

                        <div>{message.content}</div>

                        {message.fileUrl && (
                          <a
                            href={message.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              color: isMine
                                ? "white"
                                : "#2563eb",
                              display: "block",
                              marginTop: "6px",
                            }}
                          >
                            View attached file
                          </a>
                        )}

                        <div
                          style={{
                            fontSize: "11px",
                            opacity: 0.7,
                            marginTop: "5px",
                            textAlign: "right",
                          }}
                        >
                          {new Date(
                            message.createdAt
                          ).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div ref={bottomRef} />
              </div>

              {/* Message input */}

              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: "12px",
                  borderTop: "1px solid #ddd",
                  background: "white",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                  }}
                >
                  <input
                    value={content}
                    onChange={(event) =>
                      setContent(event.target.value)
                    }
                    placeholder={`Message ${
                      activeOtherUser?.name || "user"
                    }...`}
                    style={{
                      flex: 1,
                      padding: "10px",
                    }}
                  />

                  <button
                    type="submit"
                    disabled={sending}
                  >
                    {sending
                      ? "Sending..."
                      : "Send"}
                  </button>
                </div>

                <input
                  id="chat-file"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(event) =>
                    setFile(
                      event.target.files[0] || null
                    )
                  }
                  style={{ marginTop: "8px" }}
                />
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
};

export default Messages;