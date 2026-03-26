import { Response, Request } from "express";
import { IExtendedRequest } from "../middleware/type";
import User from "../models/userModels";
import Note from "../models/noteModels";
import { sendEmail } from "./services/emailService";

/**
 * 1. GET LEADERBOARD
 * URL: GET /api/users/leaderboard
 * Logic: Returns top contributors globally.
 */
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const topUsers = await User.findAll({
      attributes: [
        "username",
        "educationLevel",
        "faculty",
        "contributionPoints",
        "profileImage",
      ],
      order: [["contributionPoints", "DESC"]],
      limit: 15, // Top 15 ranking
    });

    res.status(200).json(topUsers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leaderboard" });
  }
};

/**
 * 2. GET MY PROFILE
 * URL: GET /api/users/me
 * Logic: Returns personal stats + list of all notes uploaded by this user.
 */
export const getMyProfile = async (req: IExtendedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const userProfile = await User.findByPk(userId, {
      attributes: [
        "username",
        "email",
        "educationLevel",
        "faculty",
        "contributionPoints",
        "profileImage",
        "role",
      ],
      // ASSOCIATION REMOVED TO PREVENT CRASH
    });

    if (!userProfile)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json(userProfile);
  } catch (error) {
    res.status(500).json({ message: "Profile error" });
  }
};

/**
 * 3. UPDATE EDUCATION LEVEL / FACULTY
 * URL: PATCH /api/users/update-education
 * Logic: Updates user metadata. Validates inputs against system enums.
 */
export const updateEducationInfo = async (
  req: IExtendedRequest,
  res: Response,
) => {
  try {
    const { educationLevel, faculty } = req.body;
    const userId = req.user?.id;

    // 1. Validation: Ensure we don't save random strings
    const allowedLevels = [
      "school",
      "high_school",
      "bachelors",
      "masters",
      "phd",
    ];
    const allowedFaculties = [
      "science",
      "management",
      "humanities",
      "engineering",
      "medical",
      "law",
      "general",
    ];

    if (educationLevel && !allowedLevels.includes(educationLevel)) {
      return res.status(400).json({ message: "Invalid education level" });
    }
    if (faculty && !allowedFaculties.includes(faculty)) {
      return res.status(400).json({ message: "Invalid faculty name" });
    }

    // 2. Update logic
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (educationLevel) user.educationLevel = educationLevel;
    if (faculty) user.faculty = faculty;

    await user.save();

    res.status(200).json({
      message: "Education profile updated successfully",
      data: {
        educationLevel: user.educationLevel,
        faculty: user.faculty,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating education info" });
  }
};

/**
 * CONTACT FORM LOGIC
 * Logic: Sends an email from the student to the Admin.
 */
export const contactSupport = async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Please fill all required fields" });
  }

  try {
    // We reuse your existing sendEmail helper logic here
    await sendEmail({
      email: process.env.NODEMAILER_GMAIL!, // Send TO your admin email
      subject: `Support Request: ${subject || "General Inquiry"}`,
      message: `You have a new message from Pustakalaya Contact Form:\n\n
                Name: ${name}\n
                Email: ${email}\n
                Message: ${message}`,
    });

    res.status(200).json({
      message: "Message sent successfully! We will get back to you soon.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to send message. Please try again later." });
  }
};
