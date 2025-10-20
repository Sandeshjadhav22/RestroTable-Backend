import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import connectDB from "../Db/connect.js";
import authRoutes from "./routes/auth.routes.js";
import storeRoutes from "./routes/store.routes.js";
import errorHandler from "./middleware/errorHandler.js";
import sectionRoutes from "./routes/section.routes.js";
import tableRoutes from "./routes/table.routes.js";



dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false
});

app.use(helmet());
app.use(limiter);
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin: ["http://localhost:3000","https://your-frontend.com"],
    credentials: true
  })
);
app.use(morgan("dev"));

app.get("/", (_req, res) => res.json({ message: "POS backend up" }));
app.use("/auth", authRoutes);
app.use("/stores", storeRoutes);
app.use("/sections", sectionRoutes);
app.use("/tables", tableRoutes);

app.use(errorHandler);

async function boot() {
  await connectDB(process.env.MONGODB_URL);
  app.listen(PORT, () => console.log(`Server started on PORT: ${PORT}`));
}
boot();
 