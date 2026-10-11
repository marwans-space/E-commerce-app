import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { addUser, getUserByEmail, getUserById } from "../db.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

// TODO(security): rate limit /login and /register (e.g. 5-10 attempts per 15 min per IP, plus per email for login)
// TODO: use validate(schema) (Zod) for the request bodies below (email format, name length, max lengths)

const MAX_PASSWORD_BYTES = 72; // bcrypt only uses the first 72 bytes
// Used to keep response time similar when the email doesn't exist
const DUMMY_HASH = bcrypt.hashSync("dummy-password", 10);

// TODO(security): when the front-end is on a different domain than the API, sameSite "lax" cookies are not sent
// on cross-site fetch requests. You'll need sameSite: "none" + secure: true, plus CORS credentials (index.js)
// and CSRF protection (Origin check or CSRF token). Deferred item, but it will break login in production.
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV !== "development",
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000,
};

// TODO: 24h token with no refresh and no way to revoke it. Consider a short access token (15 min) + refresh
// token, or at least re-check the user in authenticate.js. Make sure JWT_SECRET is long and random.
const signToken = (user) =>
  jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
  );

// TODO: front-end profile page will also need email and profileImg here (or from GET /profile)
const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  role: user.role,
});

const normalizeEmail = (email) => email.trim().toLowerCase();
// /me
router.get("/me", authenticate, async (req, res) => {
  const user = await getUserById(req.user.id);
  if (!user) return res.status(401).json({ error: "User no longer exists" });
  return res.status(200).json({ user: publicUser(user) });
});
// login

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};

  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Missing or invalid credentials" });
  }
  if (!email.trim() || !password) {
    return res.status(400).json({ error: "Missing credentials" });
  }
  if (Buffer.byteLength(password) > MAX_PASSWORD_BYTES) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const user = await getUserByEmail(normalizeEmail(email));

  // always run bcrypt so timing doesn't reveal whether the email exists
  const isValid = await bcrypt.compare(
    password,
    user ? user.passwordHash : DUMMY_HASH,
  );
  if (!user || !isValid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  res.cookie("token", signToken(user), cookieOptions);
  return res.status(200).json({ user: publicUser(user) });
});

// logout
router.post("/logout", (req, res) => {
  // Express 5 ignores maxAge/expires in clearCookie
  res.clearCookie("token", cookieOptions);
  res.sendStatus(204);
});

// register
router.post("/register", async (req, res, next) => {
  try {
    const { email, password, name } = req.body ?? {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof name !== "string"
    ) {
      return res.status(400).json({ error: "Missing or invalid credentials" });
    }
    if (!email.trim() || !name.trim() || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }
    // TODO: validate email format and cap email/name length (no check right now beyond "not empty")
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }
    if (Buffer.byteLength(password) > MAX_PASSWORD_BYTES) {
      return res
        .status(400)
        .json({ error: "Password must be at most 72 bytes" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await addUser({
      name: name.trim(),
      email: normalizeEmail(email),
      passwordHash,
    });
    console.log(req.body, user);
    res.cookie("token", signToken(user), cookieOptions);
    return res.status(201).json({ user: publicUser(user) });
  } catch (err) {
    // duplicate key (needs the unique index on users.email, created in connectDB)
    if (err.code === 11000) {
      return res.status(409).json({ error: "Email already registered" });
    }
    next(err);
  }
});

// TODO: POST /auth/forgot-password + POST /auth/reset-password (needs an email service, optional for a portfolio)
// TODO (optional): email verification
// TODO (optional): password change lives in the profile routes (apiRoutes.js), invalidate old tokens afterwards

export default router;
