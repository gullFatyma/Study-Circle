import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RequestDetail from "./pages/RequestDetail";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/request/:id"
          element={<RequestDetail />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* Private messages inbox */}
        <Route
          path="/messages"
          element={<Messages />}
        />

        {/* Particular private conversation */}
        <Route
          path="/messages/:conversationId"
          element={<Messages />}
        />
      </Routes>
    </>
  );
}

export default App;