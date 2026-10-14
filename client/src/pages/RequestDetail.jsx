import {
  useState,
  useEffect,
  useContext,
} from "react";

import {
  useParams,
  Link,
  useNavigate,
} from "react-router-dom";

import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import ReplyBox from "../components/ReplyBox";
import DeleteRequestButton from "../components/DeleteRequestButton";

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
      <main className="request-detail-page">
        <p className="request-detail-status">Loading...</p>
      </main>
    );
  }

  if (!request) {
    return (
      <main className="request-detail-page">
        <p className="request-detail-status">
          Request not found.
        </p>
      </main>
    );
  }

  const authorName = request.postedBy?.name || "Unknown";
  const authorInitial = authorName.charAt(0).toUpperCase();
  const formattedDate = new Date(request.createdAt).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="request-detail-page">
      <Link className="request-detail-back" to="/">
        ← Back to feed
      </Link>

      <article className="request-detail-card">
        <div className="request-detail-card-accent" />
        <div className="request-detail-top">
          <span className="request-subject-badge">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5Z" />
              <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5Z" />
            </svg>
            {request.subject}
          </span>
          {isOwner && (
            <DeleteRequestButton
              requestId={request._id}
              onDeleted={() =>
                navigate("/profile", {
                  state: { requestDeleted: true },
                })
              }
            />
          )}
        </div>

        <h1 className="request-detail-title">{request.title}</h1>

        {request.description && (
          <p className="request-detail-description">
            {request.description}
          </p>
        )}

        <div className="request-card-footer request-detail-footer">
          <div className="request-author">
            <div className="request-author-avatar">
              {authorInitial}
            </div>
            <div>
              <span>Posted by</span>
              <strong>{authorName}</strong>
            </div>
          </div>
          <time className="request-detail-date" dateTime={request.createdAt}>
            {formattedDate}
          </time>
        </div>
      </article>

      {user && !isOwner && (
        <ReplyBox requestId={id} onReplyPosted={fetchAll} />
      )}

      {user && isOwner && (
        <div className="request-owner-notice">
          <p>You cannot reply to your own request.</p>
          <Link to="/messages">Open private messages</Link>
        </div>
      )}

      <section className="request-replies-section">
        <h2 className="request-replies-heading">
          Public Replies <span>({publicReplies.length})</span>
        </h2>

        {publicReplies.length === 0 ? (
          <p className="request-replies-empty">No public replies yet.</p>
        ) : (
          <div className="request-replies-list">
            {publicReplies.map((reply) => (
              <article className="request-reply-card" key={reply._id}>
                <p>{reply.content}</p>
                {reply.fileUrl && (
                  <a href={reply.fileUrl} target="_blank" rel="noreferrer">
                    View attached file
                  </a>
                )}
                <small>— {reply.repliedBy?.name}</small>
              </article>
            ))}
          </div>
        )}
      </section>

      {isOwner && privateReplies.length > 0 && (
        <section className="request-replies-section">
          <h2 className="request-replies-heading">
            Previous Private Replies <span>({privateReplies.length})</span>
          </h2>
          <p className="request-private-replies-note">
            These previous replies are also available in the Messages section.
          </p>
          <div className="request-replies-list">
            {privateReplies.map((reply) => (
              <article
                className="request-reply-card request-reply-card--private"
                key={reply._id}
              >
                <p>{reply.content}</p>
                {reply.fileUrl && (
                  <a href={reply.fileUrl} target="_blank" rel="noreferrer">
                    View attached file
                  </a>
                )}
                <small>— {reply.repliedBy?.name} (private)</small>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default RequestDetail;