import { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import RequestCard from "../components/RequestCard";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (location.state?.requestDeleted) {
      setToast("Request deleted");
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    const fetchMyRequests = async () => {
      try {
        const { data } = await api.get("/requests");
        const filtered = data.filter((req) => req.postedBy?._id === user._id);
        setMyRequests(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchMyRequests();
  }, [user]);

  if (!user) return <p style={{ textAlign: "center" }}>Please login to view your profile.</p>;

  return (
    <div style={{ maxWidth: "700px", margin: "30px auto", padding: "0 20px" }}>
      <h2>My Profile</h2>
      {toast && (
        <div className="request-toast" role="status">
          {toast}
        </div>
      )}
      <p>
        <strong>Name:</strong> {user.name}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      {user.university && (
        <p>
          <strong>University:</strong> {user.university}
        </p>
      )}

      <hr style={{ margin: "25px 0" }} />

      <h3>My Requests ({myRequests.length})</h3>
      {loading ? (
        <p>Loading...</p>
      ) : myRequests.length === 0 ? (
        <p style={{ color: "#888" }}>You haven't posted any requests yet.</p>
      ) : (
        myRequests.map((req) => (
          <Link key={req._id} to={`/request/${req._id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <RequestCard
              request={req}
              onDeleted={() => {
                setMyRequests((current) =>
                  current.filter((request) => request._id !== req._id)
                );
                setToast("Request deleted");
              }}
            />
          </Link>
        ))
      )}
    </div>
  );
};

export default Profile;