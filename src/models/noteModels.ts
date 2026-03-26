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
import { EducationLevel } from "../middleware/type";

@Table({
  tableName: "notes",
  timestamps: true,
})
class Note extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare title: string;

  @Column({ type: DataType.TEXT })
  declare description: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare subject: string;

  @Column({
    type: DataType.ENUM("school", "high_school", "bachelors", "masters", "phd"),
    allowNull: false,
  })
  declare educationLevel: EducationLevel;

  @Column({ type: DataType.STRING, allowNull: false })
  declare fileUrl: string; // Cloudinary URL

  @Column({ type: DataType.STRING, allowNull: false })
  declare cloudinaryPublicId: string; // Needed to delete the file later

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare userId: string;

  @BelongsTo(() => User)
  declare user: User;

  @Default("pending")
  @Column(DataType.ENUM("pending", "approved", "rejected"))
  declare status: "pending" | "approved" | "rejected";
}

export default Note;
