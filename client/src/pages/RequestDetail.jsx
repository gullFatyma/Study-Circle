import {
  useState,
  useEffect,
  useContext,
} from "react";

import {
  useParams,
  Link,
} from "react-router-dom";

import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import ReplyBox from "../components/ReplyBox";

const RequestDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [request, setRequest] = useState(null);
  const [publicReplies, setPublicReplies] =
    useState([]);

  const [privateReplies, setPrivateReplies] =
    useState([]);

  const [loading, setLoading] = useState(true);

  const isOwner =
    user &&
    request &&
    request.postedBy?._id === user._id;

  const fetchAll = async () => {
    /*
      Initial page load par hi Loading show hoga.
      Reply post hone ke baad complete page hide nahi hoga.
    */
    if (!request) {
      setLoading(true);
    }

    try {
      // Request details
      const { data: requestData } =
        await api.get(`/requests/${id}`);

      setRequest(requestData);

      // Public replies
      const { data: publicData } =
        await api.get(`/replies/${id}`);

      setPublicReplies(publicData);

      /*
        Purane private replies ko temporarily load rakha hai.
        New private messages Messages page mein show honge.
      */
      if (user) {
        try {
          const { data: privateData } =
            await api.get(
              `/replies/private/${id}`
            );

          setPrivateReplies(privateData);
        } catch (err) {
          setPrivateReplies([]);
        }
      }
    } catch (err) {
      console.error(
        err.response?.data?.message ||
          "Could not load request"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?._id]);

  if (loading) {
    return (
      <p style={{ textAlign: "center" }}>
        Loading...
      </p>
    );
  }

  if (!request) {
    return (
      <p style={{ textAlign: "center" }}>
        Request not found.
      </p>
    );
  }

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "30px auto",
        padding: "0 20px",
      }}
    >
      {/* Request information */}

      <span
        style={{
          background: "#eee",
          padding: "2px 8px",
          borderRadius: "4px",
          fontSize: "12px",
        }}
      >
        {request.subject}
      </span>

      <h2 style={{ margin: "8px 0" }}>
        {request.title}
      </h2>

      {request.description && (
        <p style={{ color: "#555" }}>
          {request.description}
        </p>
      )}

      <small style={{ color: "#888" }}>
        Posted by {request.postedBy?.name}
      </small>

      <hr style={{ margin: "25px 0" }} />

      {/* Reply form only for other users */}

      {user && !isOwner && (
        <ReplyBox
          requestId={id}
          onReplyPosted={fetchAll}
        />
      )}

      {/* Request owner */}

      {user && isOwner && (
        <div
          style={{
            padding: "12px",
            marginBottom: "20px",
            background: "#f7f8fa",
            border: "1px solid #ddd",
            borderRadius: "6px",
          }}
        >
          <p
            style={{
              color: "#666",
              margin: "0 0 8px",
            }}
          >
            You cannot reply to your own request.
          </p>

          <Link to="/messages">
            Open private messages
          </Link>
        </div>
      )}

      {/* Public replies */}

      <h3 style={{ marginTop: "25px" }}>
        Public Replies ({publicReplies.length})
      </h3>

      {publicReplies.length === 0 ? (
        <p style={{ color: "#888" }}>
          No public replies yet.
        </p>
      ) : (
        publicReplies.map((reply) => (
          <div
            key={reply._id}
            style={{
              border: "1px solid #eee",
              padding: "10px",
              marginBottom: "8px",
            }}
          >
            <p style={{ margin: "0 0 4px" }}>
              {reply.content}
            </p>

            {reply.fileUrl && (
              <a
                href={reply.fileUrl}
                target="_blank"
                rel="noreferrer"
              >
                View attached file
              </a>
            )}

            <br />

            <small style={{ color: "#888" }}>
              — {reply.repliedBy?.name}
            </small>
          </div>
        ))
      )}

      {/* Old private replies */}

      {isOwner && privateReplies.length > 0 && (
        <>
          <h3 style={{ marginTop: "25px" }}>
            Previous Private Replies (
            {privateReplies.length})
          </h3>

          <p
            style={{
              color: "#666",
              fontSize: "14px",
            }}
          >
            These previous replies are also available
            in the Messages section.
          </p>

          {privateReplies.map((reply) => (
            <div
              key={reply._id}
              style={{
                border: "1px solid #eee",
                padding: "10px",
                marginBottom: "8px",
                background: "#fafafa",
              }}
            >
              <p style={{ margin: "0 0 4px" }}>
                {reply.content}
              </p>

              {reply.fileUrl && (
                <a
                  href={reply.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View attached file
                </a>
              )}

              <br />

              <small style={{ color: "#888" }}>
                — {reply.repliedBy?.name} (private)
              </small>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default RequestDetail;