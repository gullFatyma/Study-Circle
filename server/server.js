import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import http from "http";

import connectDB from "./config/db.js";
import { initializeSocket } from "./socket.js";

import authRoutes from "./routes/authRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import replyRoutes from "./routes/replyRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

dotenv.config();
connectDB();

const app = express();


const server = http.createServer(app);

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("StudyCircle API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/replies", replyRoutes);
app.use("/api/messages", messageRoutes);

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      message:
        err.code === "LIMIT_FILE_SIZE"
          ? "File size must be less than 10 MB"
          : err.message,
    });
  }

  return res.status(500).json({
    message:
      err.message || "Something went wrong",
  });
});

// Socket.IO start
initializeSocket(server);

const PORT = process.env.PORT || 5000;

/*
  Ab app.listen ki jagah server.listen use hoga.
*/
server.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});