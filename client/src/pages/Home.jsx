import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import RequestCard from "../components/RequestCard";

const Home = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
  });
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const query = subjectFilter ? `?subject=${subjectFilter}` : "";
      const { data } = await api.get(`/requests${query}`);
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPosting(true);

    try {
      await api.post("/requests", formData);
      setFormData({ title: "", description: "", subject: "" });
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "30px auto", padding: "0 20px" }}>
      <h2>StudyCircle Feed</h2>

      {user && (
        <div style={{ border: "1px solid #ddd", padding: "15px", marginBottom: "25px" }}>
          <h3>Post a Request</h3>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <div>
              <input
                type="text"
                name="title"
                placeholder="e.g. Does anyone have OOP notes?"
                value={formData.title}
                onChange={handleChange}
                required
                style={{ width: "100%", marginBottom: "8px" }}
              />
            </div>
            <div>
              <textarea
                name="description"
                placeholder="Add more detail (optional)"
                value={formData.description}
                onChange={handleChange}
                style={{ width: "100%", marginBottom: "8px" }}
              />
            </div>
            <div>
              <input
                type="text"
                name="subject"
                placeholder="Subject (e.g. OOP, DSA)"
                value={formData.subject}
                onChange={handleChange}
                required
                style={{ width: "100%", marginBottom: "8px" }}
              />
            </div>
            <button type="submit" disabled={posting}>
              {posting ? "Posting..." : "Post Request"}
            </button>
          </form>
        </div>
      )}

      <div style={{ marginBottom: "15px" }}>
        <input
          type="text"
          placeholder="Filter by subject..."
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p>No requests yet. Be the first to post!</p>
      ) : (
        requests.map((req) => (
          <Link key={req._id} to={`/request/${req._id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <RequestCard request={req} />
          </Link>
        ))
      )}
    </div>
  );
};

export default Home;