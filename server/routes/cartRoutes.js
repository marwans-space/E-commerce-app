import express from "express";
import { ObjectId } from "mongodb";
import isObjectId from "../utils/objectId.js";
import { Users, Products, getProductById } from "../db.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

const round2 = (n) => Math.round(n * 100) / 100;

// Builds the cart the front-end can display: each line has the product details,
// the line total, and whether the product can still be bought. Every cart route returns this shape.
async function getCartDetails(userId) {
  const user = await Users.findOne(
    { _id: userId },
    { projection: { cart: 1 } },
  );
  if (!user) return null;

  const cart = user.cart ?? [];
  const products = await Products.find({
    _id: { $in: cart.map((item) => item.productId) },
  }).toArray();
  const productById = new Map(products.map((p) => [p._id.toString(), p]));

  const items = cart.map((item) => {
    const product = productById.get(item.productId.toString());
    const isAvailable = Boolean(product?.isListed);
    return {
      productId: item.productId,
      quantity: item.quantity,
      name: product?.name ?? null,
      price: product?.price ?? null,
      img: product?.img ?? null,
      color: product?.color ?? null,
      size: product?.size ?? null,
      isAvailable,
      lineTotal: isAvailable ? round2(product.price * item.quantity) : 0,
    };
  });

  // unavailable items are not counted (checkout rejects them until they're removed)
  const total = round2(items.reduce((sum, item) => sum + item.lineTotal, 0));
  return { cart: items, total };
}

/* ======================================================================
   client/cart
   ====================================================================== */

// GET
router.get("/cart", authenticate, authorize("user"), async (req, res) => {
  const details = await getCartDetails(new ObjectId(req.user.id));
  if (!details) return res.status(404).json({ error: "User not found" });
  return res.status(200).json(details);
});

// POST
router.post(
  "/add-to-cart",
  authenticate,
  authorize("user"),
  async (req, res) => {
    // get the cart items from the req body
    const { productId, quantity = 1 } = req.body ?? {};

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return res
        .status(400)
        .json({ error: "Quantity must be an integer from 1 to 99" });
    }
    // check for errors
    const product = await getProductById(productId);
    if (!product || !product.isListed) {
      return res.status(404).json({ error: "Product not found" });
    }
    // get user using id
    const userId = new ObjectId(req.user.id);

    // the cart total for one item can't go over 99
    const existing = await Users.findOne(
      { _id: userId, "cart.productId": product._id },
      { projection: { "cart.$": 1 } },
    );
    const currentQty = existing?.cart?.[0]?.quantity ?? 0;
    if (currentQty + quantity > 99) {
      return res.status(400).json({ error: "Maximum quantity per item is 99" });
    }

    // TODO (low priority): bump + push are two writes, two simultaneous requests can create duplicate cart lines.
    const bumped = await Users.updateOne(
      { _id: userId, "cart.productId": product._id },
      { $inc: { "cart.$.quantity": quantity } },
    );
    if (bumped.matchedCount === 0) {
      await Users.updateOne(
        { _id: userId },
        { $push: { cart: { productId: product._id, quantity } } },
      );
    }
    // 200
    return res.status(200).json(await getCartDetails(userId));
  },
);

// PATCH (set the quantity of one item, not add to it)
router.patch(
  "/cart/:productId",
  authenticate,
  authorize("user"),
  async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body ?? {};
    if (!isObjectId(productId)) {
      return res.status(400).json({ error: "Invalid product id" });
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return res
        .status(400)
        .json({ error: "Quantity must be an integer from 1 to 99" });
    }
    const userId = new ObjectId(req.user.id);

    const result = await Users.updateOne(
      { _id: userId, "cart.productId": new ObjectId(productId) },
      { $set: { "cart.$.quantity": quantity } },
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Item not in cart" });
    }
    return res.status(200).json(await getCartDetails(userId));
  },
);

// DELETE (one item)
router.delete(
  "/cart/:productId",
  authenticate,
  authorize("user"),
  async (req, res) => {
    const { productId } = req.params;
    if (!isObjectId(productId)) {
      return res.status(400).json({ error: "Invalid product id" });
    }
    const userId = new ObjectId(req.user.id);
    const pid = new ObjectId(productId);

    const result = await Users.updateOne(
      { _id: userId, "cart.productId": pid },
      { $pull: { cart: { productId: pid } } },
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Item not in cart" });
    }
    return res.status(200).json(await getCartDetails(userId));
  },
);

// DELETE (clear cart)
router.delete("/cart", authenticate, authorize("user"), async (req, res) => {
  const userId = new ObjectId(req.user.id);
  await Users.updateOne({ _id: userId }, { $set: { cart: [] } });
  return res.status(200).json({ cart: [], total: 0 });
});

export default router;
