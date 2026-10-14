import DeleteRequestButton from "./DeleteRequestButton";

const RequestCard = ({ request, onDeleted }) => {
  const authorName =
    request.postedBy?.name || "Unknown";

  const authorInitial = authorName
    .charAt(0)
    .toUpperCase();

  const formattedDate = new Date(
    request.createdAt
  ).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="request-card">
      <div className="request-card-accent" />

      <div
        className={`request-card-top${
          onDeleted ? " request-card-top--deletable" : ""
        }`}
      >
        <span className="request-subject-badge">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5Z" />

            <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5Z" />
          </svg>

          {request.subject}
        </span>

        <div className="request-card-top-actions">
          <span className="request-card-date">
            {formattedDate}
          </span>
          {onDeleted && (
            <DeleteRequestButton
              requestId={request._id}
              onDeleted={onDeleted}
            />
          )}
        </div>
      </div>

      <h3 className="request-card-title">
        {request.title}
      </h3>

      {request.description && (
        <p className="request-card-description">
          {request.description}
        </p>
      )}

      <div className="request-card-footer">
        <div className="request-author">
          <div className="request-author-avatar">
            {authorInitial}
          </div>

          <div>
            <span>Posted by</span>
            <strong>{authorName}</strong>
          </div>
        </div>

        <div className="request-open-action">
          View request

          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </div>
    </article>
  );
};

export default RequestCard;