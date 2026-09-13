import express from "express";
import {
  createRequest,
  getRequests,
  getRequestById,
  deleteRequest,
} from "../controllers/requestController.js";
import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();

router.post("/", protect, createRequest);
router.get("/", getRequests);
router.get("/:id", getRequestById);
router.delete("/:id", protect, deleteRequest);

export default router;