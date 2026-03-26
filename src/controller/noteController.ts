import { Response, Request } from "express";
import { IExtendedRequest, UserRole } from "../middleware/type";
import Note from "../models/noteModels";
import User from "../models/userModels";
import { cloudinary } from "../services/cloudinaryConfig";

// 1. Upload a New Note (Status starts as 'pending')
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
      status: "pending",
    });

    res.status(201).json({
      message: "Note uploaded! It will be live after admin approval.",
      data: newNote,
    });
  } catch (error) {
    res.status(500).json({ message: "Error uploading note", error });
  }
};

// 2. The Smart Feed (Personalized for logged-in user)
export const getMyLevelNotes = async (req: IExtendedRequest, res: Response) => {
  try {
    const userLevel = req.user?.level;
    const userFaculty = req.user?.faculty;

    if (!userLevel)
      return res.status(400).json({ message: "User level not found" });

    const filter: any = {
      educationLevel: userLevel,
      status: "approved",
    };

    if (userLevel !== "school" && userFaculty) {
      filter.faculty = userFaculty;
    }

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

// 3. Get All Approved Notes (Simple version for Frontend filtering)
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

// 4. Get Single Note Detail
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

    if (!note) return res.status(404).json({ message: "Note not found" });

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: "Error fetching note details" });
  }
};

// 5. Get Pending Notes (Admin Dashboard List)
export const getPendingNotes = async (req: IExtendedRequest, res: Response) => {
  try {
    const pendingNotes = await Note.findAll({
      where: { status: "pending" },
      include: [{ model: User, attributes: ["username", "email"] }],
      order: [["createdAt", "ASC"]],
    });
    res.status(200).json(pendingNotes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending notes" });
  }
};

// 6. Admin Review: Approve/Reject & Award Points
export const reviewNote = async (req: IExtendedRequest, res: Response) => {
  try {
    const { noteId, action } = req.body;
    const note: any = await (Note as any).findByPk(noteId);

    if (!note) return res.status(404).json({ message: "Note not found" });

    if (action === "approve") {
      note.status = "approved";
      await note.save();

      const uploader = await User.findByPk(note.userId);
      if (uploader) {
        (uploader as any).contributionPoints += 10;
        await (uploader as any).save();
      }
      return res
        .status(200)
        .json({ message: "Note approved and 10 points awarded." });
    } else {
      await cloudinary.uploader.destroy(note.cloudinaryPublicId);
      await note.destroy();
      return res.status(200).json({ message: "Note rejected and deleted." });
    }
  } catch (error) {
    res.status(500).json({ message: "Moderation error" });
  }
};

// 7. Report Note (Community Safety)
export const reportNote = async (req: IExtendedRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const note: any = await (Note as any).findByPk(id);

    if (!note) return res.status(404).json({ message: "Note not found" });

    note.reportCount += 1;
    if (note.reportCount >= 5) {
      note.status = "pending";
    }

    await note.save();
    res.status(200).json({ message: "Reported successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error reporting note" });
  }
};

// 8. Log Download & Award Points
export const logDownload = async (req: IExtendedRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const note: any = await (Note as any).findByPk(id);

    if (note) {
      note.downloadsCount += 1;
      await note.save();
      const uploader = await User.findByPk(note.userId);
      if (uploader) {
        (uploader as any).contributionPoints += 1;
        await (uploader as any).save();
      }
    }
    res.status(200).json({ message: "Download logged" });
  } catch (error) {
    res.status(500).json({ message: "Error logging download" });
  }
};

// 9. Delete Note (Owner or Admin)
export const deleteNote = async (req: IExtendedRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const note: any = await (Note as any).findByPk(id);

    if (!note) return res.status(404).json({ message: "Note not found" });

    if (
      note.userId !== req.user?.id &&
      req.user?.role !== UserRole.SuperAdmin
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await cloudinary.uploader.destroy(note.cloudinaryPublicId);
    await note.destroy();
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting note" });
  }
};
