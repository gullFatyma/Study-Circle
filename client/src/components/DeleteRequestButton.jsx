import { useState } from "react";
import { deleteRequest } from "../services/api";

const DeleteRequestButton = ({ requestId, onDeleted }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const openDialog = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setError("");
    setIsOpen(true);
  };

  const closeDialog = (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (!deleting) setIsOpen(false);
  };

  const handleDelete = async (event) => {
    event.stopPropagation();
    event.preventDefault();
    setError("");
    setDeleting(true);

    try {
      await deleteRequest(requestId);
      setIsOpen(false);
      onDeleted();
    } catch (deleteError) {
      setError(
        deleteError.response?.data?.message ||
          "Could not delete this request. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="request-delete-trigger"
        title="Delete"
        aria-label="Delete request"
        aria-haspopup="dialog"
        onClick={openDialog}
        disabled={deleting}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 7h16" />
          <path d="M10 11v6M14 11v6" />
          <path d="m5 7 1 14h12l1-14M9 7V4h6v3" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="delete-confirm-backdrop"
          onClick={closeDialog}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <section
            className="delete-confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-request-title"
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
            }}
          >
            <h2 id="delete-request-title">
              Delete this request?
            </h2>
            <p>
              This will also remove all replies. This cannot be undone.
            </p>

            {error && (
              <p className="delete-confirm-error" role="alert">
                {error}
              </p>
            )}

            <div className="delete-confirm-actions">
              <button
                type="button"
                className="delete-cancel-button"
                onClick={closeDialog}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-confirm-button"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default DeleteRequestButton;
