import multer from "multer";
import { cloudinary, storage } from "../services/cloudinaryConfig";
import { Request } from "express";

const upload = multer({
  storage: storage,

  fileFilter: (req: Request, file: Express.Multer.File, cb) => {
    // Allow images and documents
    const allowedFileTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "application/pdf",
      "application/msword", // .doc
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    ];

    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only images or PDF/DOC/DOCX files are allowed!"));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max
  },
});

export default upload;
