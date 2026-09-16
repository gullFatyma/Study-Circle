import {
  useContext,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

const Signup = () => {
  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      password: "",
    });

  const [error, setError] = useState("");
  const [loading, setLoading] =
    useState(false);

  const { login } =
    useContext(AuthContext);

  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const { data } = await api.post(
        "/auth/signup",
        formData
      );

      login(data);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-brand-panel">
          <span className="auth-brand-label">
            STUDYCIRCLE
          </span>

          <h1>
            Your learning
            <br />
            circle starts here.
          </h1>

          <p>
            Join students who help each other
            learn, share and move forward.
          </p>

          <div className="auth-feature-list">
            <div>
              <span>✓</span>
              Share and request study resources
            </div>

            <div>
              <span>✓</span>
              Get answers from classmates
            </div>

            <div>
              <span>✓</span>
              Keep conversations private
            </div>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-header">
            <span className="auth-eyebrow">
              JOIN THE COMMUNITY
            </span>

            <h2>Create your account</h2>

            <p>
              Complete the details below to join
              StudyCircle.
            </p>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <div className="auth-field">
              <label htmlFor="signup-name">
                Full name
              </label>

              <div className="auth-input-wrapper">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="8"
                    r="4"
                  />

                  <path d="M4 21a8 8 0 0 1 16 0" />
                </svg>

                <input
                  id="signup-name"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="signup-email">
                Email address
              </label>

              <div className="auth-input-wrapper">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M4 5h16v14H4Z" />
                  <path d="m4 7 8 6 8-6" />
                </svg>

                <input
                  id="signup-email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="signup-password">
                  Password
                </label>

                <span>
                  Minimum 6 characters
                </span>
              </div>

              <div className="auth-input-wrapper">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect
                    x="4"
                    y="10"
                    width="16"
                    height="11"
                    rx="2"
                  />

                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>

                <input
                  id="signup-password"
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength="6"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : "Create account"}

              {!loading && <span>→</span>}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?

            <Link to="/login">
              Login
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Signup;