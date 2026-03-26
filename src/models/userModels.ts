import {
  Table,
  PrimaryKey,
  Column,
  Model,
  DataType,
  Default,
  Unique,
  IsEmail,
  HasMany,
} from "sequelize-typescript";
import { UserRole, EducationLevel, Faculty } from "../middleware/type";
import Note from "./noteModels";

@Table({ tableName: "users", timestamps: true })
class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column({ allowNull: false }) declare username: string;

  @Unique @IsEmail @Column({ allowNull: false }) declare email: string;

  @Column({ allowNull: true }) declare password?: string;

  @Column(DataType.STRING) declare profileImage?: string;

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

  @Default(0) @Column(DataType.INTEGER) declare contributionPoints: number;

  @Column(DataType.STRING) declare otp?: string;

  @Column(DataType.DATE) declare otpExpiry?: Date;

  // Association: Explicitly state 'userId' as the target key
  @HasMany(() => Note, "userId")
  declare notes: Note[];
}

export default User;
