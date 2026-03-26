import { Request, Response } from "express";
import User from "../../models/userModels";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto"; // Built-in Node module
import nodemailer from "nodemailer";

// ... (keep your existing imports and social login logic) ...

// Helper function to send email
const sendEmail = async (options: {
  email: string;
  subject: string;
  message: string;
}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_GMAIL,
      pass: process.env.NODEMAILER_GMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `Notes Portal <${process.env.NODEMAILER_GMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

// ----------------------------------------------------------------
// 5. Forgot Password
// ----------------------------------------------------------------
const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email)
    return res.status(400).json({ message: "Please provide your email" });

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "No user found with that email" });
    }

    // 1. Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Set expiry (e.g., 10 minutes from now)
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // 3. Save to database
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // 4. Send email
    try {
      await sendEmail({
        email: user.email,
        subject: "Your Password Reset OTP",
        message: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`,
      });

      res.status(200).json({ message: "OTP sent to your email!" });
    } catch (err) {
      // If email fails, clear the OTP fields
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();
      return res
        .status(500)
        .json({ message: "Error sending email. Try again later." });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// ----------------------------------------------------------------
// 6. Reset Password
// ----------------------------------------------------------------
const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // 1. Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Check if OTP matches and hasn't expired
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiry && new Date() > user.otpExpiry) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // 3. Hash new password and update user
    user.password = bcrypt.hashSync(newPassword, 12);

    // 4. Clear OTP fields so they can't be used again
    user.otp = "";
    user.otpExpiry = undefined;

    await user.save();

    res
      .status(200)
      .json({ message: "Password reset successful! You can now login." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  // ... your other exports
  forgotPassword,
  resetPassword,
};
