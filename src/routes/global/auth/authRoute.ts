import express, { Router } from "express";
import {
  registerStudent,
  loginUser,
  googleLogin,
  facebookLogin,
  seedAdmin,
} from "../../../global/auth/authController"; // Adjust path if needed

const router: Router = express.Router();

/**
 * 1. STANDARD REGISTRATION
 * Route: POST /api/auth/register
 * Body: { username, email, password, educationLevel, faculty }
 */
router.post("/register", registerStudent);

/**
 * 2. STANDARD LOGIN
 * Route: POST /api/auth/login
 * Body: { email, password }
 */
router.post("/login", loginUser);

/**
 * 3. GOOGLE LOGIN
 * Route: POST /api/auth/google-login
 * Body: { idToken, educationLevel, faculty }
 */
router.post("/google-login", googleLogin);

/**
 * 4. FACEBOOK LOGIN
 * Route: POST /api/auth/facebook-login
 * Body: { accessToken, educationLevel, faculty }
 */
router.post("/facebook-login", facebookLogin);

router.post("/seed-admin", seedAdmin);

export default router;
