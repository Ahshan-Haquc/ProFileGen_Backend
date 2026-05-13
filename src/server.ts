import dotenv from "dotenv";
import app from "./app";
import databaseConnect from "./config/databaseConnect";

dotenv.config();

const port = process.env.PORT ?? "3000";

databaseConnect();

app.listen(Number(port), () => {
  console.log("Server running on port: ", port);
});