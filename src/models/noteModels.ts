import {
  Table,
  PrimaryKey,
  Column,
  Model,
  DataType,
  Default,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import User from "./userModels";
import { EducationLevel, Faculty } from "../middleware/type";

@Table({ tableName: "notes", timestamps: true })
class Note extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column({ allowNull: false }) declare title: string;
  @Column(DataType.TEXT) declare description: string;
  @Column({ allowNull: false }) declare subject: string;

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

  @Column({ allowNull: false }) declare fileUrl: string;
  @Column({ allowNull: false }) declare cloudinaryPublicId: string;

  @Default("pending")
  @Column(DataType.ENUM("pending", "approved", "rejected"))
  declare status: "pending" | "approved" | "rejected";

  @Default(0) @Column(DataType.INTEGER) declare downloadsCount: number;
  @Default(0) @Column(DataType.INTEGER) declare reportCount: number;

  // Foreign Key
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare userId: string;

  // Association: Explicitly state 'userId' as the key
  @BelongsTo(() => User, "userId")
  declare uploader: User;
}
export default Note;
