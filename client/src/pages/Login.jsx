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

const Login = () => {
  const [formData, setFormData] =
    useState({
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
        "/auth/login",
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
            Learn better,
            <br />
            together.
          </h1>

          <p>
            Connect with classmates, exchange
            notes and find the academic support
            you need.
          </p>

          <div className="auth-feature-list">
            <div>
              <span>✓</span>
              Request notes and study material
            </div>

            <div>
              <span>✓</span>
              Connect privately with students
            </div>

            <div>
              <span>✓</span>
              Build a helpful learning community
            </div>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-header">
            <span className="auth-eyebrow">
              WELCOME BACK
            </span>

            <h2>Login to StudyCircle</h2>

            <p>
              Enter your details to continue to
              your account.
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
              <label htmlFor="login-email">
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
                  id="login-email"
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
                <label htmlFor="login-password">
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
                  id="login-password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
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
                ? "Logging in..."
                : "Login"}

              {!loading && <span>→</span>}
            </button>
          </form>

          <p className="auth-switch">
            Don&apos;t have an account?

            <Link to="/signup">
              Create account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Login;