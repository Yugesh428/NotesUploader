import express, { Router } from "express";
import {
  forgotPassword,
  resetPassword,
} from "../../../global/auth/forgetAndResetController"; // Adjust path if needed

const router: Router = express.Router();

// Route to request an OTP (Email)
// Body: { email }
router.post("/forgot-password", forgotPassword);

// Route to verify OTP and set new password
// Body: { email, otp, newPassword }
router.post("/reset-password", resetPassword);

export default router;
