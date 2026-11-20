import express from "express";
import { Reviews } from "../db.js";

const router = express.Router();

router.get("/reviews", async (req, res) => {
  const reviews = await Reviews.find().sort({ rating: -1 }).limit(3).toArray();
  return res.status(200).json({ reviews });
});
export default router;
