import { Request } from "express";

// 1. Roles
export enum UserRole {
  STUDENT = "student",
  MODERATOR = "moderator",
  SuperAdmin = "SuperAdmin",
}

// 2. Education Levels
export type EducationLevel =
  | "school"
  | "high_school"
  | "bachelors"
  | "masters"
  | "phd";

// 3. ADDED: Faculty / Stream
// This is used for High School (+2) and above
export type Faculty =
  | "science"
  | "management"
  | "humanities"
  | "engineering"
  | "medical"
  | "law"
  | "general"; // 'general' is for school level students

// 4. Extended Request
export interface IExtendedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    username?: string;
    role: UserRole;
    level: EducationLevel;
    faculty: Faculty; // Added this so controllers can filter by Stream
  };
}
