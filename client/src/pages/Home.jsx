import {
  useContext,
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import RequestCard from "../components/RequestCard";

const Home = () => {
  const { user } = useContext(AuthContext);

  const [requests, setRequests] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [subjectFilter, setSubjectFilter] =
    useState("");

  const [formData, setFormData] =
    useState({
      title: "",
      description: "",
      subject: "",
    });

  const [posting, setPosting] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] =
    useState("");

  const fetchRequests = async () => {
    setLoading(true);

    try {
      const query = subjectFilter.trim()
        ? `?subject=${encodeURIComponent(
            subjectFilter.trim()
          )}`
        : "";

      const { data } = await api.get(
        `/requests${query}`
      );

      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectFilter]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setPosting(true);

    try {
      await api.post(
        "/requests",
        formData
      );

      setFormData({
        title: "",
        description: "",
        subject: "",
      });

      setSuccess(
        "Your request has been posted successfully."
      );

      await fetchRequests();
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
    <main className="feed-page">
      {/* Page heading */}

      <section className="feed-hero">
        <div>
          <span className="feed-eyebrow">
            STUDENT COMMUNITY
          </span>

          <h1>StudyCircle Feed</h1>

          <p>
            Ask for notes, share knowledge and
            learn together with your classmates.
          </p>
        </div>

        <div className="feed-user-summary">
          <div className="feed-user-avatar">
            {user?.name
              ?.charAt(0)
              .toUpperCase() || "S"}
          </div>

          <div>
            <span>Welcome back</span>

            <strong>
              {user?.name || "Student"}
            </strong>
          </div>
        </div>
      </section>

      {/* Post request card */}

      {user && (
        <section className="request-form-card">
          <div className="request-form-heading">
            <div className="request-form-icon">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
              </svg>
            </div>

            <div>
              <h2>Post a Request</h2>

              <p>
                Tell your classmates what
                learning material you need.
              </p>
            </div>
          </div>

          {error && (
            <div className="form-message form-error">
              {error}
            </div>
          )}

          {success && (
            <div className="form-message form-success">
              {success}
            </div>
          )}

          <form
            className="request-form"
            onSubmit={handleSubmit}
          >
            <div className="form-field form-field-large">
              <label htmlFor="request-title">
                What do you need?
              </label>

              <div className="premium-input-wrapper">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                  />

                  <path d="M9.7 9a2.5 2.5 0 0 1 4.8 1c0 1.7-2.5 2-2.5 3.5" />
                  <path d="M12 17h.01" />
                </svg>

                <input
                  id="request-title"
                  type="text"
                  name="title"
                  placeholder="e.g. Does anyone have OOP notes?"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="request-subject">
                Subject
              </label>

              <div className="premium-input-wrapper">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5Z" />

                  <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5Z" />
                </svg>

                <input
                  id="request-subject"
                  type="text"
                  name="subject"
                  placeholder="e.g. OOP, DSA"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-field form-field-full">
              <label htmlFor="request-description">
                Additional details
                <span>Optional</span>
              </label>

              <textarea
                id="request-description"
                name="description"
                placeholder="Add context, topics or chapters you need help with..."
                value={formData.description}
                onChange={handleChange}
                rows="4"
              />

              <small>
                Keep it clear so students can
                respond quickly.
              </small>
            </div>

            <div className="request-form-footer">
              <span>
                Your request will be visible to
                the StudyCircle community.
              </span>

              <button
                type="submit"
                className="post-request-button"
                disabled={posting}
              >
                {posting
                  ? "Posting..."
                  : "Post Request"}

                {!posting && (
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="m5 12 14-7-4 14-3-6Z" />
                    <path d="m12 13 7-8" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Feed controls */}

      <section className="feed-section">
        <div className="feed-section-header">
          <div>
            <span className="feed-section-label">
              COMMUNITY REQUESTS
            </span>

            <h2>Recent requests</h2>
          </div>

          <div className="subject-filter">
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
              placeholder="Filter by subject..."
              value={subjectFilter}
              onChange={(event) =>
                setSubjectFilter(
                  event.target.value
                )
              }
            />

            {subjectFilter && (
              <button
                type="button"
                onClick={() =>
                  setSubjectFilter("")
                }
                aria-label="Clear filter"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="requests-list">
          {loading ? (
            <div className="feed-status-card">
              Loading requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="feed-status-card">
              <h3>No requests found</h3>

              <p>
                Be the first student to post a
                request.
              </p>
            </div>
          ) : (
            requests.map((request) => (
              <Link
                key={request._id}
                to={`/request/${request._id}`}
                className="request-card-link"
              >
                <RequestCard
                  request={request}
                />
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  );
};

export default Home;
