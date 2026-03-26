import "reflect-metadata"; // <-- THIS MUST BE THE VERY FIRST LINE
import app from "./src/app";
import { envConfig } from "./src/config/config";
import "./src/models/connection"; // This file likely connects to Sequelize and loads models

function startServer() {
  const port = envConfig.portNumber || 8000; // Use envConfig for port or default to 8000
  app.listen(port, function () {
    console.log(`Server has started at port ${port}`); // <-- Use the 'port' variable here
  });
}

startServer();
