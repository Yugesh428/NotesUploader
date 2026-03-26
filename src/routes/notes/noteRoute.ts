import express, { Router } from "express";
import {
  uploadNote,
  getNotes,
  getNoteById,
  getMyLevelNotes,
  getPendingNotes,
  reviewNote,
  reportNote,
  logDownload,
  deleteNote,
} from "../../controller/noteController";
import { isLoggedIn, restrictTo } from "../../middleware/middleware";
import upload from "../../middleware/multerUpload";
import { UserRole } from "../../middleware/type";

const router: Router = express.Router();

// Public Discovery
router.get("/all", getNotes);
router.get("/:id", getNoteById);

// Student Feed & Actions
router.get("/feed", isLoggedIn, getMyLevelNotes);
router.post("/upload", isLoggedIn, upload.single("file"), uploadNote);
router.post("/report/:id", isLoggedIn, reportNote);
router.post("/download/:id", isLoggedIn, logDownload);

// Admin Moderation
router.get(
  "/admin/pending",
  isLoggedIn,
  restrictTo(UserRole.SuperAdmin),
  getPendingNotes,
);
router.patch(
  "/admin/review",
  isLoggedIn,
  restrictTo(UserRole.SuperAdmin),
  reviewNote,
);

// Cleanup
router.delete("/:id", isLoggedIn, deleteNote);

export default router;
