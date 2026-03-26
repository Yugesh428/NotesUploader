import app from "./src/app";
import { envConfig } from "./src/config/config";
import "./src/models/connection";

function startServer() {
  const port = envConfig.portNumber;
  app.listen(port, function () {
    console.log(`Server has started at port ${8000}`);
  });
}

startServer();
