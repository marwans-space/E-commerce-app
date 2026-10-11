/*
 * ======================================================================
 * BACKEND TODO OVERVIEW
 * Tags used in every file:
 *   BUG:             broken or wrong right now, fix first
 *   TODO(security):  must be done before deploying
 *   TODO:            missing feature / improvement
 *
 * NEW FILES TO CREATE
 *   config/env.js              validate required env vars at startup (PORT, MONGO_URI, JWT_SECRET, CLIENT_URL, NODE_ENV)
 *   middleware/validate.js     validate(schema) middleware using Zod (share schemas with the front-end)
 *   middleware/errorHandler.js central error handler + 404 handler
 *   middleware/rateLimiter.js  express-rate-limit (strict for /auth/login and /auth/register)
 *   middleware/upload.js       multer config for profile image / product image (or start with URL-only images)
 *   utils/objectId.js          shared isObjectId() (currently duplicated idea in apiRoutes.js + db.js)
 *   schemas/*.js               Zod schemas: auth, product, order, review, profile
 *   scripts/seed.js            seed data (no id fields, addresses as plain strings)
 *   tests/                     supertest: auth, cart, checkout, admin authorization
 *   .env.example, README.md    document env vars and endpoints
 * ======================================================================
 */
import "dotenv/config";
import env from "./config/env.js";
import express from "express";
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

// TODO(security): validate env vars at startup and exit if any are missing (config/env.js)

const app = express();
const port = env.PORT ?? 3000;

// TODO(security): app.set("trust proxy", 1) when deployed behind a proxy (Render, Railway, Nginx),
// otherwise secure cookies and rate limiting by IP won't work correctly.
// TODO(security): app.use(helmet()) (security headers)
// TODO: request logging (morgan)
// TODO: compression()

// TODO(security): limit body size: express.json({ limit: "10kb" })
app.use(express.json());
// TODO(security): restrict CORS: cors({ origin: process.env.CLIENT_URL, credentials: true }).
// Open cors() will not send cookies cross-origin, and allows any site to call the API.
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
// TODO(security): rate limiter on /auth (login/register) and a looser global limiter on /api
// TODO(security): if the front-end is on a different domain, cookies need sameSite: "none" + secure
// (see authRoute.js) and then you need CSRF protection (check Origin header or CSRF token).

// TODO: GET /health endpoint (db ping) for the hosting platform
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

try {
  await connectDB();
  app.listen(port, () => console.log(`🚀 Server is running on port ${port}`));
  // TODO: graceful shutdown (SIGTERM/SIGINT: close server and client.close())
} catch (error) {
  console.error("❌ Database connection error:", error);
  process.exit(1);
}
