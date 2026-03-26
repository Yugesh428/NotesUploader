import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config(); // 1. THIS MUST BE AT THE VERY TOP

import app from "./src/app";
import { envConfig } from "./src/config/config";
import "./src/models/connection";

function startServer() {
  // 2. LOGIC FIX: Render provides a 'PORT' variable. We must use it.
  // If process.env.PORT is not used, Render cannot "see" your app.
  const port = process.env.PORT || envConfig.portNumber || 8000;

  app.listen(port, () => {
    console.log(`🚀 Pustakalaya live on port: ${port}`);
    // Check again - these should now show "FOUND"
    console.log("DB_HOST CHECK:", process.env.DB_HOST ? "FOUND" : "MISSING");
  });
}

startServer();
