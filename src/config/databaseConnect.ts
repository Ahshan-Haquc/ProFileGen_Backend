import mongoose from "mongoose";

const databaseConnect = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_ATLAS_URI_CONNECTION_STRING ?? "mongodb://localhost:27017/CVgenerator");
    console.log("Database connected with cloud");
  } catch (error) {
    console.error("Not connected with database.", error);
    throw error;
  }
};

export default databaseConnect;
