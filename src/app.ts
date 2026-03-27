import express, { Application } from "express";
import cors from "cors";
import authRoutes from "./routes/global/auth/authRoute";
import forgotAndResetRoute from "./routes/global/auth/forgotAndResetRoute";
import noteRoutes from "./routes/notes/noteRoute";

import userRoute from "./routes/userRoute/userRoute";

const app: Application = express();

// --- MIDDLEWARES ---
app.use(express.json()); // Essential for parsing JSON bodies
app.use(express.urlencoded({ extended: true })); // Good practice for form-data
app.use(
  cors({
    origin: ["http://localhost:3000", "https://pustkalaya.vercel.app"], // Your Frontend URL
  }),
);

// --- ROUTES ---

// 1. Standard Auth (Login, Register, Social Logins)
// Endpoint: http://localhost:8000/api/auth/...
app.use("/api/auth", authRoutes);

// 2. Password Recovery (Forgot, Reset)
// Endpoint: http://localhost:8000/api/auth/...
app.use("/api/auth", forgotAndResetRoute);
app.use("/api/notes", noteRoutes);
app.use("/api/users", userRoute);

export default app;
