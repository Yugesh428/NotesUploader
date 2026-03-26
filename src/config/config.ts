import { config } from "dotenv";
config();

export const envConfig = {
  portNumber: process.env.PORT,
  clientURL: process.env.CLIENT_URL,
};
