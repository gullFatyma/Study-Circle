import { useContext } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } =
    useContext(AuthContext);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 30px",
        borderBottom: "1px solid #ddd",
      }}
    >
      <Link
        to="/"
        style={{
          fontWeight: "bold",
          fontSize: "20px",
          textDecoration: "none",
        }}
      >
        StudyCircle
      </Link>

      <div
        style={{
          display: "flex",
          gap: "15px",
          alignItems: "center",
        }}
      >
        {user ? (
          <>
            <Link to="/">
              Feed
            </Link>

            <Link to="/messages">
              Messages
            </Link>

            <Link to="/profile">
              Profile
            </Link>

            <span>
              Hi, {user.name}
            </span>

            <button onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">
              Login
            </Link>

            <Link to="/signup">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;