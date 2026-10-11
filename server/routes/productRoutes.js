import express from "express";
import { Products, getProductById } from "../db.js";

const router = express.Router();

/* ======================================================================
   client/product (public)
   ====================================================================== */

// GET (list): /products?category=hoodie&page=1&limit=12
router.get("/products", async (req, res) => {
  const { category } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 50);

  const filter = { isListed: true };
  // typeof check: a query like ?category[$ne]=x must not become a Mongo operator
  if (typeof category === "string" && category) filter.category = category;

  const [items, total] = await Promise.all([
    Products.find(filter)
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    Products.countDocuments(filter),
  ]);
  return res
    .status(200)
    .json({ items, page, totalPages: Math.ceil(total / limit), total });
});

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
  const categories = await Products.find({ isListed: true });
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

// POST
// (none)

// PATCH
// (none)

// DELETE
// (none)

// TODO (later): search (text index) and price filters/sorting

export default router;
