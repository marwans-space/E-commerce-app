import express from "express";
import { Products, getProductById } from "../db.js";

const router = express.Router();

// Featured products must stay above /products/:id.
router.get("/products/featured", async (req, res) => {
  const items = await Products.find({ isListed: true, isFeatured: true })
    .sort({ _id: -1 })
    .limit(8)
    .toArray();
  return res.status(200).json({ items });
});

router.get("/products", async (req, res) => {
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const category =
    typeof req.query.category === "string" ? req.query.category.trim() : "";

  const filter = { isListed: true };

  if (category && category !== "all") {
    const escapedCategory = category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.category = { $regex: `^${escapedCategory}$`, $options: "i" };
  }

  if (query) {
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: { $regex: escapedQuery, $options: "i" } },
      { description: { $regex: escapedQuery, $options: "i" } },
      { category: { $regex: escapedQuery, $options: "i" } },
    ];
  }

  const categories = await Products.find(filter).toArray();
  return res.status(200).json({ categories });
});

router.get("/products/:id", async (req, res) => {
  const product = await getProductById(req.params.id);
  // unlisted (soft-deleted) products are hidden from the public
  if (!product || !product.isListed) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.status(200).json(product);
});

export default router;
