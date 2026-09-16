import {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  NavLink,
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
  const menuRef = useRef(null);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [menuOpen, setMenuOpen] =
    useState(false);

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

    connectSocket();
    loadUnreadCount();

    const handleNewMessage = () => {
      setUnreadCount(
        (currentCount) => currentCount + 1
      );
    };

    const handleMessagesRead = () => {
      loadUnreadCount();
    };

    socket.on(
      "message:new",
      handleNewMessage
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

      window.removeEventListener(
        "messages:read-local",
        handleMessagesRead
      );
    };
  }, [user]);

  // Dropdown se bahar click karne par close
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const handleLogout = () => {
    disconnectSocket();
    logout();
    setMenuOpen(false);
    navigate("/login");
  };

  const navClass = ({ isActive }) =>
    isActive
      ? "nav-link nav-link-active"
      : "nav-link";

  return (
    <header className="site-header">
      <nav className="site-navbar">
        <Link
          to="/"
          className="site-logo"
        >
          StudyCircle
        </Link>

        <div className="nav-center">
          <NavLink
            to="/"
            className={navClass}
          >
            Feed
          </NavLink>

          <NavLink
            to="/messages"
            className={navClass}
          >
            Messages
          </NavLink>

          <NavLink
            to="/profile"
            className={navClass}
          >
            Profile
          </NavLink>
        </div>

        <div className="nav-right">
          {user ? (
            <>
              {/* Notification bell */}

              <Link
                to="/messages"
                className="notification-button"
                aria-label="Open unread messages"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="notification-icon"
                  aria-hidden="true"
                >
                  <path
                    d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M10 21h4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>

                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </Link>

              <div className="navbar-divider" />

              {/* User menu */}

              <div
                className="user-menu"
                ref={menuRef}
              >
                <button
                  type="button"
                  className="user-menu-button"
                  onClick={() =>
                    setMenuOpen(
                      (current) => !current
                    )
                  }
                >
                  <span className="navbar-avatar">
                    {user.name
                      ?.charAt(0)
                      .toUpperCase()}
                  </span>

                  <span className="navbar-greeting">
                    Hi, {user.name}
                  </span>

                  <svg
                    viewBox="0 0 24 24"
                    className={
                      menuOpen
                        ? "chevron-icon chevron-open"
                        : "chevron-icon"
                    }
                    aria-hidden="true"
                  >
                    <path
                      d="m7 10 5 5 5-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {menuOpen && (
                  <div className="user-dropdown">
                    <Link
                      to="/profile"
                      className="dropdown-item"
                      onClick={() =>
                        setMenuOpen(false)
                      }
                    >
                      View Profile
                    </Link>

                    <button
                      type="button"
                      className="dropdown-item dropdown-logout"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={navClass}
              >
                Login
              </NavLink>

              <NavLink
                to="/signup"
                className={navClass}
              >
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;