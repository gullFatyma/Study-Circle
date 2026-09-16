const RequestCard = ({ request }) => {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "6px",
        padding: "15px",
        marginBottom: "12px",
      }}
    >
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
      <h3 style={{ margin: "8px 0 4px" }}>{request.title}</h3>
      {request.description && (
        <p style={{ margin: "0 0 8px", color: "#555" }}>{request.description}</p>
      )}
      <small style={{ color: "#888" }}>
        Posted by {request.postedBy?.name || "Unknown"} •{" "}
        {new Date(request.createdAt).toLocaleDateString()}
      </small>
    </div>
  );
};

export default RequestCard;