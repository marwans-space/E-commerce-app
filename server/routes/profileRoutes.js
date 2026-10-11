import express from "express";
import { ObjectId } from "mongodb";
import { Users, Orders } from "../db.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

const toProfile = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  address: user.address,
  number: user.number,
  profileImg: user.profileImg,
});

const PROFILE_PROJECTION = {
  name: 1,
  email: 1,
  address: 1,
  number: 1,
  profileImg: 1,
};

/* ======================================================================
   client/profile
   ====================================================================== */

// GET
router.get("/profile", authenticate, authorize("user"), async (req, res) => {
  const user = await Users.findOne(
    { _id: new ObjectId(req.user.id) },
    { projection: PROFILE_PROJECTION },
  );
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.status(200).json({ user: toProfile(user) });
});

// GET (the user's own orders, newest first)
router.get(
  "/profile/orders",
  authenticate,
  authorize("user"),
  async (req, res) => {
    const orders = await Orders.find({ userId: new ObjectId(req.user.id) })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    return res.status(200).json({ orders });
  },
);

// POST
// TODO: POST /profile/image (upload) if you add file uploads, otherwise accept an image URL

// PATCH (only name, address and number can be changed here)
router.patch("/profile", authenticate, authorize("user"), async (req, res) => {
  const { name, address, number } = req.body ?? {};
  const updates = {};

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim() || name.trim().length > 100) {
      return res.status(400).json({ error: "Invalid name" });
    }
    updates.name = name.trim();
  }
  if (address !== undefined) {
    if (
      typeof address !== "string" ||
      !address.trim() ||
      address.trim().length > 300
    ) {
      return res.status(400).json({ error: "Invalid address" });
    }
    updates.address = address.trim();
  }
  if (number !== undefined) {
    if (
      typeof number !== "string" ||
      !/^\+?[0-9\s-]{7,20}$/.test(number.trim())
    ) {
      return res.status(400).json({ error: "Invalid phone number" });
    }
    updates.number = number.trim();
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  const userId = new ObjectId(req.user.id);
  const result = await Users.updateOne({ _id: userId }, { $set: updates });
  if (result.matchedCount === 0) {
    return res.status(404).json({ error: "User not found" });
  }
  const user = await Users.findOne(
    { _id: userId },
    { projection: PROFILE_PROJECTION },
  );
  return res.status(200).json({ user: toProfile(user) });
});
// TODO: PATCH /profile/password  (current password + new password, same 8..72 byte rules as register)
// TODO: PATCH /profile/image  (profile picture)

// DELETE
// TODO: DELETE /profile  (user deletes own account: re-enter password; decide hard delete vs anonymize,
// orders keep userId/userName and can't be deleted)

export default router;
