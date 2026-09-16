import {
  useContext,
  useEffect,
  useMemo,
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

import socket, {
  connectSocket,
} from "../socket";

const Messages = () => {
  const { conversationId } = useParams();

  const { user, loading: authLoading } =
    useContext(AuthContext);

  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const [conversations, setConversations] =
    useState([]);

  const [conversation, setConversation] =
    useState(null);

  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const loadConversations = async () => {
    try {
      const { data } = await api.get(
        "/messages"
      );

      setConversations(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load conversations"
      );
    }
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

      window.dispatchEvent(
        new Event("messages:read-local")
      );

      await loadConversations();
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
    if (!user) return;

    connectSocket();
    loadConversations();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    loadThread();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, user?._id]);

  useEffect(() => {
    if (!user) return;

    const handleNewMessage = async (
      payload
    ) => {
      if (
        payload.conversationId ===
        conversationId
      ) {
        await loadThread();
      } else {
        await loadConversations();
      }
    };

    const handleMessagesRead = (
      payload
    ) => {
      if (
        payload.conversationId !==
        conversationId
      ) {
        return;
      }

      setMessages((currentMessages) =>
        currentMessages.map((message) => {
          const senderId =
            message.sender?._id ||
            message.sender;

          if (senderId === user._id) {
            return {
              ...message,
              read: true,
            };
          }

          return message;
        })
      );
    };

    socket.on(
      "message:new",
      handleNewMessage
    );

    socket.on(
      "messages:read",
      handleMessagesRead
    );

    return () => {
      socket.off(
        "message:new",
        handleNewMessage
      );

      socket.off(
        "messages:read",
        handleMessagesRead
      );
    };
  }, [conversationId, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const getOtherParticipant = (item) =>
    item?.participants?.find(
      (participant) =>
        participant._id !== user?._id
    );

  const filteredConversations = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    if (!searchValue) {
      return conversations;
    }

    return conversations.filter(
      (item) => {
        const otherUser =
          getOtherParticipant(item);

        return (
          otherUser?.name
            ?.toLowerCase()
            .includes(searchValue) ||
          item.request?.title
            ?.toLowerCase()
            .includes(searchValue) ||
          item.request?.subject
            ?.toLowerCase()
            .includes(searchValue)
        );
      }
    );
  }, [conversations, search, user?._id]);

  const handleSendMessage = async (
    event
  ) => {
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
        document.getElementById(
          "chat-file"
        );

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

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  const formatConversationDate = (
    date
  ) => {
    const messageDate = new Date(date);
    const today = new Date();

    const isToday =
      messageDate.toDateString() ===
      today.toDateString();

    if (isToday) {
      return formatTime(date);
    }

    return messageDate.toLocaleDateString(
      [],
      {
        month: "short",
        day: "numeric",
      }
    );
  };

  if (authLoading || !user) {
    return (
      <div className="page-loading">
        Loading...
      </div>
    );
  }

  const activeOtherUser =
    getOtherParticipant(conversation);

  return (
    <main className="messages-page">
      <div className="messages-shell">
        {/* Conversation sidebar */}

        <aside className="conversations-panel">
          <div className="conversations-header">
            <h1>Messages</h1>

            <p>
              Collaborate. Learn. Go further
              together.
            </p>
          </div>

          <div className="conversation-search">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
              />

              <path d="m20 20-4-4" />
            </svg>

            <input
              type="search"
              placeholder="Search conversations"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <div className="conversation-list">
            {filteredConversations.length ===
            0 ? (
              <div className="empty-conversations">
                {search
                  ? "No matching conversations."
                  : "No private conversations yet."}
              </div>
            ) : (
              filteredConversations.map(
                (item) => {
                  const otherUser =
                    getOtherParticipant(item);

                  const isActive =
                    item._id ===
                    conversationId;

                  return (
                    <Link
                      key={item._id}
                      to={`/messages/${item._id}`}
                      className={
                        isActive
                          ? "conversation-item conversation-item-active"
                          : "conversation-item"
                      }
                    >
                      <div className="conversation-avatar">
                        {otherUser?.name
                          ?.charAt(0)
                          .toUpperCase() ||
                          "U"}
                      </div>

                      <div className="conversation-content">
                        <div className="conversation-top-row">
                          <strong>
                            {otherUser?.name ||
                              "User"}
                          </strong>

                          <span>
                            {item.lastMessage
                              ?.createdAt
                              ? formatConversationDate(
                                  item
                                    .lastMessage
                                    .createdAt
                                )
                              : ""}
                          </span>
                        </div>

                        <div className="conversation-subject">
                          {item.request
                            ?.subject ||
                            "Study request"}
                        </div>

                        <div className="conversation-preview-row">
                          <span className="conversation-preview">
                            {item.lastMessage
                              ?.sender?._id ===
                            user._id
                              ? "You: "
                              : ""}

                            {item.lastMessage
                              ?.content ||
                              "Start conversation"}
                          </span>

                          {item.unreadCount >
                            0 && (
                            <span className="conversation-unread">
                              {item.unreadCount >
                              99
                                ? "99+"
                                : item.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                }
              )
            )}
          </div>
        </aside>

        {/* Chat panel */}

        <section className="chat-panel">
          {!conversationId ? (
            <div className="empty-chat">
              <div className="empty-chat-icon">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
                </svg>
              </div>

              <h2>
                Select a conversation
              </h2>

              <p>
                Choose a student from your
                messages to continue chatting.
              </p>
            </div>
          ) : (
            <>
              {/* Chat header */}

              <header className="chat-header">
                <div className="chat-user">
                  <div className="chat-avatar">
                    {activeOtherUser?.name
                      ?.charAt(0)
                      .toUpperCase() ||
                      "U"}
                  </div>

                  <div>
                    <h2>
                      {activeOtherUser?.name ||
                        "Private conversation"}
                    </h2>

                    <p>
                      {conversation?.request
                        ?.subject}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="chat-options-button"
                  aria-label="Conversation options"
                >
                  •••
                </button>
              </header>

              {/* Request context */}

              <div className="request-context">
                <div className="request-context-icon">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5Z" />

                    <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5Z" />
                  </svg>
                </div>

                <div className="request-context-text">
                  <strong>
                    Related to your request
                  </strong>

                  <span>
                    {
                      conversation?.request
                        ?.title
                    }
                  </span>
                </div>

                <span className="request-arrow">
                  ›
                </span>
              </div>

              {/* Messages */}

              <div className="chat-messages">
                {messages.length > 0 && (
                  <div className="chat-date-divider">
                    <span>
                      {new Date(
                        messages[0].createdAt
                      ).toLocaleDateString(
                        [],
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>
                )}

                {error && (
                  <div className="chat-error">
                    {error}
                  </div>
                )}

                {messages.map((message) => {
                  const senderId =
                    message.sender?._id ||
                    message.sender;

                  const isMine =
                    senderId === user._id;

                  return (
                    <div
                      key={message._id}
                      className={
                        isMine
                          ? "message-row message-row-mine"
                          : "message-row"
                      }
                    >
                      {!isMine && (
                        <div className="message-avatar">
                          {message.sender?.name
                            ?.charAt(0)
                            .toUpperCase() ||
                            "U"}
                        </div>
                      )}

                      <div className="message-wrapper">
                        <div
                          className={
                            isMine
                              ? "message-bubble message-bubble-mine"
                              : "message-bubble message-bubble-received"
                          }
                        >
                          <p>
                            {message.content}
                          </p>
                        </div>

                        {message.fileUrl && (
                          <a
                            href={
                              message.fileUrl
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="message-attachment"
                          >
                            <div className="attachment-icon">
                              <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path d="M6 2h8l4 4v16H6Z" />

                                <path d="M14 2v5h5" />

                                <path d="M9 13h6M9 17h5" />
                              </svg>
                            </div>

                            <div className="attachment-details">
                              <strong>
                                Attached study
                                document
                              </strong>

                              <span>
                                Open attachment
                              </span>
                            </div>

                            <span className="attachment-options">
                              •••
                            </span>
                          </a>
                        )}

                        <div className="message-meta">
                          <span>
                            {formatTime(
                              message.createdAt
                            )}
                          </span>

                          {isMine && (
                            <span className="message-status">
                              {message.read
                                ? "✓✓ Read"
                                : "✓ Sent"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div ref={bottomRef} />
              </div>

              {/* Composer */}

              <form
                className="message-composer"
                onSubmit={handleSendMessage}
              >
                <label
                  htmlFor="chat-file"
                  className={
                    file
                      ? "attach-button attach-button-selected"
                      : "attach-button"
                  }
                  title={
                    file
                      ? file.name
                      : "Attach a file"
                  }
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="m21.4 11.6-8.9 8.9a6 6 0 0 1-8.5-8.5l9.6-9.6a4 4 0 0 1 5.7 5.7l-9.6 9.6a2 2 0 0 1-2.8-2.8l8.9-8.9" />
                  </svg>
                </label>

                <input
                  id="chat-file"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(event) =>
                    setFile(
                      event.target
                        .files[0] || null
                    )
                  }
                  hidden
                />

                <input
                  type="text"
                  className="message-input"
                  placeholder={
                    file
                      ? `Attached: ${file.name}`
                      : "Type a message..."
                  }
                  value={content}
                  onChange={(event) =>
                    setContent(
                      event.target.value
                    )
                  }
                />

                <button
                  type="submit"
                  className="send-button"
                  disabled={sending}
                >
                  {sending
                    ? "Sending..."
                    : "Send"}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
};

export default Messages;