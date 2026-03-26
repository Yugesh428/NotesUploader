import { Response } from "express";
import { IExtendedRequest } from "../../src/middleware/type";
import User from "../../src/models/userModels";
import Note from "../../src/models/noteModels";

/**
 * 1. GET LEADERBOARD
 * Logic: Fetch top contributors based on points.
 * Used for: Gamification and showing top students.
 */
export const getLeaderboard = async (req: IExtendedRequest, res: Response) => {
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
      limit: 15, // Show top 15 students
    });

    res.status(200).json(topUsers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leaderboard" });
  }
};

/**
 * 2. GET MY PROFILE
 * Logic: Returns user details + all their uploaded notes.
 * Used for: The "My Uploads" section in the student dashboard.
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
      include: [
        {
          model: Note,
          // LOGIC: The user sees ALL their notes (pending, approved, or rejected)
          order: [["createdAt", "DESC"]],
        },
      ],
    });

    if (!userProfile)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json(userProfile);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};

/**
 * 3. UPDATE EDUCATION LEVEL / FACULTY
 * Logic: Allows students to change their grade/stream.
 * Used for: When a student graduates from School to High School.
 */
export const updateEducationInfo = async (
  req: IExtendedRequest,
  res: Response,
) => {
  try {
    const { educationLevel, faculty } = req.body;
    const userId = req.user?.id;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (educationLevel) user.educationLevel = educationLevel;
    if (faculty) user.faculty = faculty;

    await user.save();

    res.status(200).json({
      message: "Education info updated successfully",
      data: { educationLevel: user.educationLevel, faculty: user.faculty },
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating education info" });
  }
};
