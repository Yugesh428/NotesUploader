import express, { Router } from "express";
import {
  contactSupport,
  getLeaderboard,
  getMyProfile,
  updateEducationInfo,
} from "../../../src/controller/userController";
import { isLoggedIn } from "../../middleware/middleware";

const router: Router = express.Router();

/**
 * Public: Anyone can see who the top contributors are.
 * GET /api/users/leaderboard
 */
router.get("/leaderboard", getLeaderboard);

/**
 * Private: View my own stats, points, and notes.
 * GET /api/users/me
 */
router.get("/me", isLoggedIn, getMyProfile);

/**
 * Private: Update my grade/faculty.
 * PATCH /api/users/update-education
 */
router.patch("/update-education", isLoggedIn, updateEducationInfo);
router.post("/contact", contactSupport);

export default router;
