import { Sequelize } from "sequelize-typescript";
import { config } from "dotenv";
config();

// ✅ Import the User model directly
import User from "../models/userModels"; // make sure this path and export is correct
import note from "../models/noteModels"; // make sure this path and export is correct

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  dialect: "mysql",
  port: Number(process.env.DB_PORT),

  // ✅ Use the actual model class, not a string path
  models: [User, note],
});

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Authenticated, connected");
  })
  .catch((error) => {
    console.log("❌ Authentication error:", error);
  });

sequelize.sync({ alter: true }).then(() => {
  console.log("✅ Migrated successfully with new changes");
});

export default sequelize;
