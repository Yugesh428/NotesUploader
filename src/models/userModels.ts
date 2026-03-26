import {
  Table,
  PrimaryKey,
  Column,
  Model,
  DataType,
  Default,
  Unique,
  IsEmail,
  HasMany, // Added for relationship
} from "sequelize-typescript";
import { UserRole, EducationLevel, Faculty } from "../middleware/type";
import Note from "./noteModels"; // Import Note model

@Table({
  tableName: "users",
  modelName: "User",
  timestamps: true,
})
class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare username: string;

  @Unique
  @IsEmail
  @Column({ type: DataType.STRING, allowNull: false })
  declare email: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare password?: string;

  // Added: Profile Image for Leaderboard/Profile
  @Column({ type: DataType.STRING, allowNull: true })
  declare profileImage?: string;

  @Column({
    type: DataType.ENUM("student", "moderator", "SuperAdmin"),
    defaultValue: "student",
  })
  declare role: UserRole;

  @Column({
    type: DataType.ENUM("school", "high_school", "bachelors", "masters", "phd"),
    allowNull: false,
  })
  declare educationLevel: EducationLevel;

  // Added: Faculty (Used for High School & above filtering)
  @Default("general")
  @Column({
    type: DataType.ENUM(
      "science",
      "management",
      "humanities",
      "engineering",
      "medical",
      "law",
      "general",
    ),
  })
  declare faculty: Faculty;

  // Social Login IDs
  @Column(DataType.STRING)
  declare googleId?: string;

  @Column(DataType.STRING)
  declare facebookId?: string;

  // Security
  @Column(DataType.STRING)
  declare otp?: string;

  @Column(DataType.DATE)
  declare otpExpiry?: Date;

  @Default(0)
  @Column(DataType.INTEGER)
  declare contributionPoints: number;

  // Added: Relationship Logic
  @HasMany(() => Note)
  declare notes: Note[];
}

export default User;
