
import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import connectDB from "../Db/connect.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import storeRoutes from "./routes/store.routes.js";
import sectionRoutes from "./routes/section.routes.js";
import tableRoutes from "./routes/table.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import menuRoutes from "./routes/menu.routes.js";
import orderRoutes from "./routes/order.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

// Error handler
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

// CORS
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : ["http://localhost:3000", "https://restrotable.vercel.app"];

// Core middleware
app.use(helmet());
app.use(limiter);
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(morgan("dev"));

// Health
app.get("/", (_req, res) => res.json({ message: "POS backend up" }));

// Routes
app.use("/auth", authRoutes);
app.use("/stores", storeRoutes);
app.use("/sections", sectionRoutes);
app.use("/tables", tableRoutes);
app.use("/settings", settingsRoutes);
app.use("/", menuRoutes);  
app.use("/", orderRoutes); 
app.use("/", analyticsRoutes); 

// Error handler
app.use(errorHandler);


async function boot() {
  await connectDB(process.env.MONGODB_URL);
  app.listen(PORT, () => {
    console.log(`API listening on ${PORT}`);
  });
}
boot();
