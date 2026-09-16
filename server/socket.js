import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import User from "./models/User.js";

let io;

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  // Socket authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(
          new Error("Authentication token missing")
        );
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      const user = await User.findById(
        decoded.id
      ).select("-password");

      if (!user) {
        return next(
          new Error("User not found")
        );
      }

      socket.user = user;

      next();
    } catch (error) {
      next(
        new Error("Socket authentication failed")
      );
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();

    /*
      Har logged-in user apne private room mein join hoga.
      Example: user:abc123
    */
    socket.join(`user:${userId}`);

    console.log(
      `${socket.user.name} connected to messages`
    );

    socket.on("disconnect", () => {
      console.log(
        `${socket.user.name} disconnected from messages`
      );
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialized"
    );
  }

  return io;
};