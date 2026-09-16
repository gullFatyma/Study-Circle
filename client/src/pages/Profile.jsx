import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import RequestCard from "../components/RequestCard";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

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
            <RequestCard request={req} />
          </Link>
        ))
      )}
    </div>
  );
};

export default Profile;