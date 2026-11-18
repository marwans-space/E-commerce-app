import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { Users, addUser, getUserByEmail, getUserById } from "../db.js";
import authenticate from "../middleware/authenticate.js";
const router = express.Router();

const MAX_PASSWORD_BYTES = 72; // bcrypt only uses the first 72 bytes
const DUMMY_HASH = bcrypt.hashSync("dummy-password", 10);

const isProd = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: 24 * 60 * 60 * 1000,
};

const signToken = (user) =>
  jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
  );

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  role: user.role,
  profileImg: user.profileImg,
  cart: user.cart,
  wishlist: user.wishlist,
  address: user.address,
  number: user.number,
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
// Change password
router.patch("/change-pass", authenticate, async (req, res) => {
  const { oldPassword, newPassword } = req.body ?? {};
  if (
    typeof oldPassword !== "string" ||
    typeof newPassword !== "string"
  ) {
    return res.status(400).json({ error: "Missing or invalid credentials" });
  }
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: "Missing credentials" });
  }
  if (newPassword.length < 8 || newPassword.length > 16) {
    return res
      .status(400)
      .json({ error: "Password must be 8-16 characters" });
  }
  if (Buffer.byteLength(newPassword) > MAX_PASSWORD_BYTES) {
    return res
      .status(400)
      .json({ error: "Password must be at most 72 bytes" });
  }
  if (oldPassword === newPassword) {
    return res
      .status(400)
      .json({ error: "The old and new passwords can't be equal" });
  }
  if (!ObjectId.isValid(req.user.id)) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const oid = new ObjectId(req.user.id);
  const user = await Users.findOne({ _id: oid });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const isValid = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isValid) {
    return res.status(400).json({ error: "Invalid credentials" });
  }
  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  await Users.updateOne(
    { _id: oid },
    { $set: { passwordHash: newPasswordHash } },
  );
  res.clearCookie("token", cookieOptions);
  return res.status(200).json({ message: "Changed successfully" });
});
export default router;
