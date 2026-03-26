import { Response, Request } from "express";
import { IExtendedRequest, UserRole } from "../middleware/type";
import Note from "../models/noteModels";
import User from "../models/userModels";
import { cloudinary } from "../services/cloudinaryConfig";

// 1. UPLOAD NOTE (Student/Logged-in User)
export const uploadNote = async (req: IExtendedRequest, res: Response) => {
  try {
    const { title, description, subject, educationLevel, faculty } = req.body;
    const userId = req.user?.id;

    if (!req.file)
      return res.status(400).json({ message: "Please upload a file" });

    const newNote = await Note.create({
      title,
      description,
      subject,
      educationLevel,
      faculty: faculty || "general",
      fileUrl: req.file.path,
      cloudinaryPublicId: (req.file as any).filename,
      userId,
      status: "pending", // Starts hidden until admin review
    });

    res.status(201).json({
      message: "Note uploaded! Waiting for admin approval.",
      data: newNote,
    });
  } catch (error) {
    res.status(500).json({ message: "Error uploading note", error });
  }
};

// 2. SMART FEED (Personalized for current student)
export const getMyLevelNotes = async (req: IExtendedRequest, res: Response) => {
  try {
    const userLevel = req.user?.level;
    const userFaculty = req.user?.faculty;

    if (!userLevel)
      return res.status(400).json({ message: "User level not found" });

    const filter: any = { status: "approved", educationLevel: userLevel };

    // If not school level, filter by specific stream (Faculty)
    if (userLevel !== "school" && userFaculty) filter.faculty = userFaculty;

    const notes = await Note.findAll({
      where: filter,
      include: [{ model: User, attributes: ["username", "profileImage"] }],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching feed" });
  }
};

// 3. GET SINGLE NOTE BY ID (Added function to fix TSError)
export const getNoteById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const note = await Note.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ["username", "profileImage", "contributionPoints"],
        },
      ],
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: "Error fetching note details" });
  }
};

// 4. ADMIN PENDING QUEUE
export const getPendingNotes = async (req: IExtendedRequest, res: Response) => {
  try {
    const pendingNotes = await Note.findAll({
      where: { status: "pending" },
      include: [{ model: User, attributes: ["username", "email"] }],
      order: [["createdAt", "ASC"]],
    });
    res.status(200).json(pendingNotes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending queue" });
  }
};

// 5. ADMIN REVIEW ACTION (Approve/Reject)
export const reviewNote = async (req: IExtendedRequest, res: Response) => {
  try {
    const { noteId, action } = req.body;
    const note = await Note.findByPk(noteId);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (action === "approve") {
      note.status = "approved";
      await note.save();

      // Award 10 Contribution Points for quality upload
      const uploader = await User.findByPk(note.userId);
      if (uploader) {
        uploader.contributionPoints += 10;
        await uploader.save();
      }
      return res
        .status(200)
        .json({ message: "Approved and 10 points awarded!" });
    } else {
      // Reject: Cleanup Cloudinary and DB
      await cloudinary.uploader.destroy(note.cloudinaryPublicId);
      await note.destroy();
      return res
        .status(200)
        .json({ message: "Rejected and permanently deleted." });
    }
  } catch (error) {
    res.status(500).json({ message: "Moderation action failed" });
  }
};

// 6. DOWNLOAD TRACKER (Awards +1 point per download)
export const logDownload = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const note = await Note.findByPk(id);

    if (note) {
      note.downloadsCount += 1;
      await note.save();

      // Reward uploader
      const uploader = await User.findByPk(note.userId);
      if (uploader) {
        uploader.contributionPoints += 1;
        await uploader.save();
      }
    }
    res.status(200).json({ message: "Download logged" });
  } catch (error) {
    res.status(500).json({ message: "Error tracking download" });
  }
};

// 7. REPORT NOTE (Community Safety)
export const reportNote = async (req: IExtendedRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const note = await Note.findByPk(id);

    if (!note) return res.status(404).json({ message: "Note not found" });

    note.reportCount += 1;
    // Auto-Hide logic: if 5+ people report it, hide it for admin review
    if (note.reportCount >= 5) {
      note.status = "pending";
    }

    await note.save();
    res
      .status(200)
      .json({ message: "Reported successfully. Admin will investigate." });
  } catch (error) {
    res.status(500).json({ message: "Error reporting note" });
  }
};

// 8. DELETE NOTE (Owner or Admin only)
export const deleteNote = async (req: IExtendedRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const note = await Note.findByPk(id);

    if (!note) return res.status(404).json({ message: "Note not found" });

    // Permission Check: Must be uploader or a SuperAdmin
    if (
      note.userId !== req.user?.id &&
      req.user?.role !== UserRole.SuperAdmin
    ) {
      return res.status(403).json({ message: "Unauthorized to delete this" });
    }

    await cloudinary.uploader.destroy(note.cloudinaryPublicId);
    await note.destroy();
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting note" });
  }
};

// 9. GET ALL APPROVED NOTES (Public Browse)
export const getNotes = async (req: Request, res: Response) => {
  try {
    const notes = await Note.findAll({
      where: { status: "approved" },
      include: [{ model: User, attributes: ["username", "profileImage"] }],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notes" });
  }
};
