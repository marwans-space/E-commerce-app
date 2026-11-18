import "dotenv/config";
import env from "./config/env.js";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { connectDB } from "./db.js";
import authRoutes from "./routes/authRoute.js";
import orderRoutes from "./routes/orderRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import cookieParser from "cookie-parser";
import morgan from "morgan";

const app = express();
const port = env.PORT ?? 3000;

app.use(express.json());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(cookieParser());
app.use(helmet());
app.use(morgan());
app.use((req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  if (req.get("origin") !== env.CLIENT_URL) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
});

// Routes
app.get("/health", (req, res) =>
  res.status(200).send("API working and healthy!"),
);
app.use("/auth", authRoutes);
app.use(
  "/api",
  productRoutes,
  cartRoutes,
  wishlistRoutes,
  profileRoutes,
  reviewRoutes,
  orderRoutes,
);

app.use((req, res) => {
  return res.status(404).json({ error: "404 Not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(err.status ?? 500).json({ error: "Internal server error" });
});
// Listener and DB
try {
  await connectDB();
  app.listen(port, () => console.log(`🚀 Server is running on port ${port}`));
} catch (error) {
  console.error("❌ Database connection error:", error);
  process.exit(1);
}
