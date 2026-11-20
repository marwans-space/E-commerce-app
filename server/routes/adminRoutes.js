import express from "express";
import { ObjectId } from "mongodb";
import isObjectId from "../utils/objectId.js";
import {
  Users,
  Products,
  Orders,
} from "../db.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";

// Mounted at /api/admin (see apiRoutes.js), so the paths below are /api/admin/products etc.
const router = express.Router();

// every route in this file is admin-only
router.use(authenticate, authorize("admin"));

router.get("/admin/dashboard", async (req, res) => {
  const [totalOrders, totalProducts, totalUsers, recentOrders] =
    await Promise.all([
      Orders.countDocuments(),
      Products.countDocuments(),
      Users.countDocuments(),
      Orders.find().sort({ createdAt: -1 }).limit(5).toArray(),
    ]);

  return res.status(200).json({
    totalOrders,
    totalProducts,
    totalUsers,
    recentOrders,
  });
});

/* ======================================================================
   admin/products
   ====================================================================== */

router.get("/admin/products", async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const pageSize = Math.min(
    Math.max(Number.parseInt(req.query.pageSize, 10) || 10, 1),
    50,
  );
  const [products, total] = await Promise.all([
    Products.find()
      .sort({ _id: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray(),
    Products.countDocuments(),
  ]);
  return res.status(200).json({
    items: products,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  });
});

router.post("/admin/products", async (req, res) => {
  const {
    name,
    imgs,
    isListed,
    isFeatured,
    description,
    category,
    price,
    instructions,
    color,
    size,
    stock,
  } = req.body;

  const numericPrice = Number(price);
  if (
    typeof name !== "string" ||
    !Array.isArray(imgs) ||
    imgs.length !== 3 ||
    !imgs.every((img) => typeof img === "string" && img.trim()) ||
    typeof description !== "string" ||
    typeof category !== "string" ||
    !Number.isFinite(numericPrice) ||
    numericPrice <= 0 ||
    !Number.isInteger(numericPrice * 100) ||
    typeof instructions !== "string" ||
    !Array.isArray(color) ||
    !color.length ||
    !Array.isArray(size) ||
    !size.length ||
    !Array.isArray(stock) ||
    !stock.length ||
    !stock.every(
      (item) =>
        item &&
        typeof item.color === "string" &&
        item.color.trim() &&
        typeof item.size === "string" &&
        item.size.trim() &&
        Number.isInteger(item.quantity) &&
        item.quantity >= 0,
    ) ||
    typeof isListed !== "boolean" ||
    typeof isFeatured !== "boolean"
  ) {
    return res.status(400).json({ error: "Missing or invalid product fields" });
  }

  const product = {
    name: name.trim(),
    description: description.trim(),
    category: category.trim(),
    price: numericPrice,
    instructions: instructions.trim(),
    imgs: imgs.map((img) => img.trim()),
    color: color.map((value) => String(value).trim()).filter(Boolean),
    size: size.map((value) => String(value).trim()).filter(Boolean),
    stock: stock.map((item) => ({
      color: item.color.trim(),
      size: item.size.trim(),
      quantity: item.quantity,
    })),
    isListed,
    isFeatured,
    reviews: [],
  };
  if (
    !product.name ||
    !product.description ||
    !product.category ||
    !product.instructions ||
    !product.imgs[0] ||
    !product.color.length ||
    !product.size.length
  ) {
    return res.status(400).json({ error: "Missing or invalid product fields" });
  }
  const { insertedId } = await Products.insertOne(product);
  return res.status(201).json({ ...product, _id: insertedId });
});

router.patch("/admin/products/:id", async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) {
    return res.status(400).json({ error: "Invalid product id" });
  }
  const pid = new ObjectId(id);
  const allowedFields = [
    "name",
    "description",
    "category",
    "price",
    "instructions",
    "imgs",
    "color",
    "size",
    "stock",
    "isListed",
    "isFeatured",
  ];
  const updates = Object.fromEntries(
    allowedFields
      .filter((field) => Object.hasOwn(req.body, field))
      .map((field) => [field, req.body[field]]),
  );
  if (!Object.keys(updates).length) {
    return res.status(400).json({ error: "No product fields to update" });
  }
  if (Object.hasOwn(updates, "price")) {
    updates.price = Number(updates.price);
    if (
      !Number.isFinite(updates.price) ||
      updates.price <= 0 ||
      !Number.isInteger(updates.price * 100)
    ) {
      return res.status(400).json({ error: "Invalid price" });
    }
  }
  if (Object.hasOwn(updates, "stock")) {
    if (
      !Array.isArray(updates.stock) ||
      !updates.stock.length ||
      !updates.stock.every(
        (item) =>
          item &&
          typeof item.color === "string" &&
          item.color.trim() &&
          typeof item.size === "string" &&
          item.size.trim() &&
          Number.isInteger(item.quantity) &&
          item.quantity >= 0,
      )
    ) {
      return res.status(400).json({ error: "Invalid stock" });
    }
  }
  const result = await Products.updateOne({ _id: pid }, { $set: updates });
  if (result.matchedCount === 0) {
    return res.status(404).json({ error: "Product not found" });
  }
  return res.status(200).json({ message: "Updated successfully" });
});
// set featured
router.patch("/admin/products/:id/featured", async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) {
    return res.status(400).json({ error: "Invalid product id" });
  }
  const pid = new ObjectId(id);
  const result = await Products.updateOne(
    { _id: pid },
    {
      $set: { isFeatured: true },
    },
  );
  if (result.matchedCount === 0) {
    return res.status(400).json({ error: "Invalid product id" });
  }
  return res.status(204).json({ message: "Updated successfully" });
});
// DELETE (soft delete: unlist the product, keep order history intact)
router.delete("/admin/products/:id", async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) {
    return res.status(400).json({ error: "Invalid product id" });
  }
  const pid = new ObjectId(id);

  const result = await Products.updateOne(
    { _id: pid },
    { $set: { isListed: false, isFeatured: false } },
  );
  if (result.matchedCount === 0) {
    return res.status(404).json({ error: "Product not found" });
  }
  // keep unlisted products out of existing carts and wishlists
  await Users.updateMany(
    {},
    {
      $pull: {
        cart: { productId: pid },
        wishlist: { $or: [{ productId: pid }, { productId: pid.toString() }] },
      },
    },
  );
  return res.status(204).send();
});

/* ======================================================================
   admin/orders
   ====================================================================== */

router.get("/admin/orders", async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const pageSize = Math.min(
    Math.max(Number.parseInt(req.query.pageSize, 10) || 10, 1),
    50,
  );
  const [orders, total] = await Promise.all([
    Orders.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray(),
    Orders.countDocuments(),
  ]);
  return res.status(200).json({
    items: orders,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  });
});

router.patch("/admin/orders/:id", async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) {
    return res.status(400).json({ error: "Invalid order id" });
  }
  const status = typeof req.body.status === "string" ? req.body.status.trim() : "";
  const statusValues = {
    "in process": "In Process",
    pending: "Pending",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  const normalizedStatus = statusValues[status.toLowerCase()];
  if (!normalizedStatus) {
    return res.status(400).json({ error: "Invalid order status" });
  }
  const result = await Orders.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status: normalizedStatus } },
  );
  if (result.matchedCount === 0) {
    return res.status(404).json({ error: "Order not found" });
  }
  return res.status(200).json({ message: "Order status updated successfully" });
});

// DELETE
// (none) orders are never deleted

/* ======================================================================
   admin/users
   ====================================================================== */

// GET
// TODO: GET /users (getUsers() already exists in db.js, add pagination), GET /users/:id

// POST
// (none)

// PATCH
// TODO (optional): change a user's role. Only admins; don't allow removing the last admin.

// DELETE
// TODO: DELETE /users/:id. Decide hard delete vs anonymize. Orders keep userId/userName and can't be deleted,
// reviews keep userId/username. An admin shouldn't be able to delete themselves.

export default router;
