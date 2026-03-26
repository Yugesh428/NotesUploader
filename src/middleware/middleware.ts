import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModels";
import { IExtendedRequest, UserRole, EducationLevel, Faculty } from "./type";

const isLoggedIn = async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization;

  if (!token) {
    res.status(404).json({
      message: "Please Provide Token",
    });
    return;
  }

  jwt.verify(token, "thisissecret", async (error, result: any) => {
    if (error) {
      res.status(403).json({
        message: "Token Invalid",
      });
    } else {
      // Fetching from DB (using 'educationLevel' from your model)
      const userData = await User.findByPk(result.id, {
        attributes: ["id", "username", "role", "educationLevel", "faculty"],
      });

      if (!userData) {
        res.status(403).json({
          message: "No user with that id, Invalid token",
        });
      } else {
        console.log(
          `[isLoggedIn] User found in database -> Role: ${userData.role}`,
        );

        // FIX: Map the DB data to match the IExtendedRequest interface
        req.user = {
          id: userData.id,
          username: userData.username,
          role: userData.role as UserRole,
          level: userData.educationLevel as EducationLevel, // Mapping educationLevel -> level
          faculty: userData.faculty as Faculty,
        };

        next();
      }
    }
  });
};

const changeUserIdForTableName = (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user && req.user.id) {
    const newUserId = req.user.id.split("-").join("_");

    // FIX: Use spread operator (...) to keep 'level', 'faculty', and 'role'
    // Otherwise, TS will complain that level and faculty are missing.
    req.user = {
      ...req.user,
      id: newUserId,
    };

    next();
  } else {
    next();
  }
};

const restrictTo = (...roles: UserRole[]) => {
  return (req: IExtendedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (userRole && roles.includes(userRole)) {
      next();
    } else {
      res.status(403).json({
        message: "Invalid, you don't have access to this..",
      });
    }
  };
};

export { isLoggedIn, restrictTo, changeUserIdForTableName };
