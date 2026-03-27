import { Sequelize } from "sequelize-typescript";
import { config } from "dotenv";
config();

// ✅ Import models correctly
import User from "../models/userModels";
import Note from "../models/noteModels"; // Capitalized for standard convention

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  dialect: "mysql",

  // ✅ Crucial for TiDB Cloud connection
  dialectOptions: {
    ssl: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: false, // Set to true if you provide the CA certificate file
    },
  },

  // ✅ Pass the model classes
  models: [User, Note],
  logging: false, // Set to console.log if you want to see SQL queries
});

// ✅ Test Connection
sequelize
  .authenticate()
  .then(() => {
    console.log("🚀 TiDB Cloud: Connection established successfully.");
  })
  .catch((error) => {
    console.error("❌ TiDB Cloud: Unable to connect:", error);
  });

// ✅ Sync Database
// In production, you might want to use migrations instead of alter: true
sequelize.sync().then(() => {
  console.log("📦 Database synced (Alter: true)");
});

export default sequelize;
