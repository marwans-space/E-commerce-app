import express from "express";
import { Products, getProductById } from "../db.js";

const router = express.Router();

/* ======================================================================
   client/product (public)
   ====================================================================== */

// GET (featured, home page). Must stay ABOVE /products/:id
router.get("/products/featured", async (req, res) => {
  const items = await Products.find({ isListed: true, isFeatured: true })
    .sort({ _id: -1 })
    .limit(8)
    .toArray();
  return res.status(200).json({ items });
});

// GET (categories for the menu / categories page)
router.get("/products", async (req, res) => {
  const categories = await Products.find({ isListed: true }).toArray();
  return res.status(200).json({ categories });
});

// GET (one product)
router.get("/products/:id", async (req, res) => {
  const product = await getProductById(req.params.id);
  // unlisted (soft-deleted) products are hidden from the public
  if (!product || !product.isListed) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.status(200).json(product);
});

export default router;
