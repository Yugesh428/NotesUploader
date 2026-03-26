import { Request, Response } from "express";
import User from "../../models/userModels";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import { UserRole, EducationLevel, Faculty } from "../../middleware/type";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || "thisissecret";

/**
 * HELPER: Generate JWT with relevant student info for discovery
 */
const generateToken = (user: any) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      level: user.educationLevel,
      faculty: user.faculty,
    },
    JWT_SECRET,
    { expiresIn: "30d" },
  );
};

// ----------------------------------------------------------------
// 1. Student Registration (Class 1 to PhD)
// ----------------------------------------------------------------
export const registerStudent = async (req: Request, res: Response) => {
  const { username, email, password, educationLevel, faculty } = req.body;

  if (!username || !email || !password || !educationLevel) {
    return res.status(400).json({ message: "Please fill all required fields" });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    await User.create({
      username,
      email,
      password: bcrypt.hashSync(password, 12),
      role: UserRole.STUDENT,
      educationLevel: educationLevel as EducationLevel,
      faculty: (faculty as Faculty) || "general", // Default 'general' for school students
    });

    return res.status(201).json({ message: "Student registered successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error during registration", error });
  }
};

// ----------------------------------------------------------------
// 2. Standard Login
// ----------------------------------------------------------------
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user: any = await User.findOne({ where: { email } });

    // Check if user exists and has a password (social users might not)
    if (!user || !user.password) {
      return res.status(404).json({ message: "Invalid credentials" });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);
    return res.status(200).json({
      data: {
        token,
        username: user.username,
        role: user.role,
        level: user.educationLevel,
        faculty: user.faculty,
      },
      message: "Login Successful",
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error during login" });
  }
};

// ----------------------------------------------------------------
// 3. Google Login (Social Discovery)
// ----------------------------------------------------------------
export const googleLogin = async (req: Request, res: Response) => {
  const { idToken, educationLevel, faculty } = req.body;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload)
      return res.status(400).json({ message: "Invalid Google Token" });

    const { email, name, picture, sub: googleId } = payload;

    let [user, created]: any = await (User as any).findOrCreate({
      where: { email },
      defaults: {
        username: name,
        email,
        googleId,
        profileImage: picture, // Capture Google Profile Pic for Leaderboard
        role: UserRole.STUDENT,
        educationLevel: educationLevel || "bachelors",
        faculty: faculty || "general",
      },
    });

    const token = generateToken(user);
    return res.status(200).json({
      data: {
        token,
        username: user.username,
        role: user.role,
        level: user.educationLevel,
      },
      message: created ? "Account created via Google" : "Login Successful",
    });
  } catch (error) {
    return res.status(500).json({ message: "Google Auth Failed", error });
  }
};

// ----------------------------------------------------------------
// 4. Facebook Login
// ----------------------------------------------------------------
interface FacebookResponse {
  email: string;
  name: string;
  id: string;
}

export const facebookLogin = async (req: Request, res: Response) => {
  const { accessToken, educationLevel, faculty } = req.body;

  try {
    const url = `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`;
    const response = await axios.get<FacebookResponse>(url);
    const { email, name, id: facebookId } = response.data;

    if (!email)
      return res
        .status(400)
        .json({ message: "Facebook account must have an email" });

    let [user, created]: any = await (User as any).findOrCreate({
      where: { email },
      defaults: {
        username: name,
        email,
        facebookId,
        role: UserRole.STUDENT,
        educationLevel: educationLevel || "bachelors",
        faculty: faculty || "general",
      },
    });

    const token = generateToken(user);
    return res.status(200).json({
      data: {
        token,
        username: user.username,
        role: user.role,
        level: user.educationLevel,
      },
      message: created ? "Account created via Facebook" : "Login Successful",
    });
  } catch (error) {
    return res.status(500).json({ message: "Facebook Auth Failed", error });
  }
};

export const seedAdmin = async (req: Request, res: Response) => {
  const { secretKey } = req.body;

  // Security Check against .env
  if (secretKey !== process.env.ADMIN_SEED_SECRET) {
    return res.status(403).json({ message: "Unauthorized seed attempt" });
  }

  try {
    const adminEmail = "admin@notes.com";
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });

    if (existingAdmin)
      return res.status(400).json({ message: "Admin already exists" });

    await User.create({
      username: "Super Admin",
      email: adminEmail,
      password: bcrypt.hashSync("admin123", 12), // Remember to change this!
      role: UserRole.SuperAdmin,
      educationLevel: "phd",
      faculty: "general",
    });

    return res.status(201).json({
      message: "Admin created!",
      credentials: { email: adminEmail, password: "admin123" },
    });
  } catch (error) {
    return res.status(500).json({ message: "Seeding failed", error });
  }
};
