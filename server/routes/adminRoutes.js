import express from "express";
import { ObjectId } from "mongodb";
import isObjectId from "../utils/objectId.js";
import { Users, Products, getProducts, getOrders } from "../db.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";

// Mounted at /api/admin (see apiRoutes.js), so the paths below are /api/admin/products etc.
const router = express.Router();

// every route in this file is admin-only
router.use(authenticate, authorize("admin"));

/* ======================================================================
   admin/products
   ====================================================================== */

// GET
// TODO: pagination + filters (category, isListed). Also GET /products/:id (returns unlisted too).
router.get("/admin/products", async (req, res) => {
  const products = await getProducts();
  return res.status(200).json(products);
});

// POST
// TODO: admin add product: validate name, description, category, price (> 0, 2 decimals), instructions,
// img, color, size, isListed, isFeatured. Never trust _id/reviews from the body.

// PATCH
// TODO: admin edit product: whitelist fields. Also used to re-list a soft-deleted product (isListed: true).

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
    { $pull: { cart: { productId: pid }, wishlist: pid } },
  );
  return res.status(204).send();
});

/* ======================================================================
   admin/orders
   ====================================================================== */

// GET
// TODO: pagination + filter by status. Also GET /orders/:id.
router.get("/admin/orders", async (req, res) => {
  const orders = await getOrders();
  return res.status(200).json(orders);
});

// POST
// (none)

// PATCH
// TODO: update order status with an allowed list and allowed transitions.
// Cancelled orders must not change status again.

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
