import dotenv from "dotenv";
import express, { type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import cvRouter from "./routes/routers";
import adminRouter from "./routes/adminRouters";
import authRouter from "./routes/authRoutes";
import subscriptionRouter from "./routes/subscriptionRoutes";
import errorHandler from "./middleware/errorHandler";

dotenv.config();

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("trust proxy", 1);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://profilegen-cv-maker-frontend.vercel.app",
      "https://profilegen-frontend.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/uploads", express.static("uploads"));

app.use("/", cvRouter);
app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/subscription", subscriptionRouter);

app.post("/test-body", (req: Request, res: Response) => {
  console.log("req.body:", req.body);
  res.json({ body: req.body });
});

app.use(errorHandler);

export default app;