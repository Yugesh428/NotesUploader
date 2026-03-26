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

// --- 1. STATIC GET ROUTES (Must come first) ---

// Public list
router.get("/all", getNotes);

// Personalized feed (Requires Login)
router.get("/feed", isLoggedIn, getMyLevelNotes);

// Admin Pending List (Requires Admin)
router.get(
  "/admin/pending",
  isLoggedIn,
  restrictTo(UserRole.SuperAdmin),
  getPendingNotes,
);

// --- 2. DYNAMIC GET ROUTES (Must come last) ---

// Get single note by ID
router.get("/:id", getNoteById);

// --- 3. POST / PATCH / DELETE ROUTES ---

router.post("/upload", isLoggedIn, upload.single("file"), uploadNote);
router.post("/report/:id", isLoggedIn, reportNote);
router.post("/download/:id", isLoggedIn, logDownload);

router.patch(
  "/admin/review",
  isLoggedIn,
  restrictTo(UserRole.SuperAdmin),
  reviewNote,
);

router.delete("/:id", isLoggedIn, deleteNote);

export default router;
