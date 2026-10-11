import express from "express";
import { Reviews } from "../db.js";

const router = express.Router();

/* ======================================================================
   client/reviews
   ====================================================================== */

// GET (home page section): /reviews?limit=6
// Reads the Reviews collection. If your reviews only exist embedded inside products, this returns an empty list.
router.get("/reviews", async (req, res) => {
  const reviews = await Reviews.find().sort({ rating: -1 }).limit(3).toArray();
  return res.status(200).json({ reviews });
});
// TODO: GET /products/:id/reviews if you stop returning them inside the product

// POST
// TODO: POST /products/:id/reviews { text, rating 0-5 }: must write to BOTH the Reviews collection and
// product.reviews (embedded, no _id). userId/username come from the token/DB, never the body.
// Decide: only buyers can review? one review per user per product? (needs a unique index)

// PATCH
// TODO (optional): edit own review. Must update both places.

// DELETE
// (none) reviews are not deletable

export default router;
