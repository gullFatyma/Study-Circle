import {
  useContext,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

import socket, {
  connectSocket,
  disconnectSocket,
} from "../socket";

const Navbar = () => {
  const { user, logout } =
    useContext(AuthContext);

  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] =
    useState(0);

  const loadUnreadCount = async () => {
    try {
      const { data } = await api.get(
        "/messages/unread-count"
      );

      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error(
        "Could not load unread messages"
      );
    }
  };

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      disconnectSocket();
      return;
    }

    // Socket ko JWT token ke saath connect karo
    connectSocket();

    // Initial unread count
    loadUnreadCount();

    /*
      New private message receive hone par
      navbar badge instantly update hoga.
    */
    const handleNewMessage = () => {
      setUnreadCount(
        (currentCount) => currentCount + 1
      );
    };

    /*
      Messages page conversation read karne ke baad
      ye custom browser event dispatch karega.
    */
    const handleMessagesRead = () => {
      loadUnreadCount();
    };

    const handleSocketError = (error) => {
      console.error(
        "Socket connection error:",
        error.message
      );
    };

    socket.on(
      "message:new",
      handleNewMessage
    );

    socket.on(
      "connect_error",
      handleSocketError
    );

    window.addEventListener(
      "messages:read-local",
      handleMessagesRead
    );

    return () => {
      socket.off(
        "message:new",
        handleNewMessage
      );

      socket.off(
        "connect_error",
        handleSocketError
      );

      window.removeEventListener(
        "messages:read-local",
        handleMessagesRead
      );
    };
  }, [user]);

  const handleLogout = () => {
    disconnectSocket();
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

            <Link
              to="/messages"
              style={{
                position: "relative",
                display: "inline-block",
              }}
            >
              Messages

              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-10px",
                    right: "-14px",
                    minWidth: "18px",
                    height: "18px",
                    padding: "0 4px",
                    borderRadius: "999px",
                    background: "#dc2626",
                    color: "white",
                    fontSize: "11px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxSizing: "border-box",
                  }}
                >
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
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