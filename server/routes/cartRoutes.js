import express from "express";
import { ObjectId } from "mongodb";
import isObjectId from "../utils/objectId.js";
import { Users, Products, getProductById, getUserById } from "../db.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

router.get("/cart", authenticate, authorize("user"), async (req, res) => {
  const user = await getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const userCart = user.cart;
  const cart = await Promise.all(
    userCart.map(async (product) => {
      const id = new ObjectId(product.productId);
      const item = await Products.findOne({ _id: id });
      return {
        name: item.name,
        price: item.price,
        img: item.imgs[0],
        productId: item._id,
        quantity: product.quantity,
        color: product.color,
        size: product.size,
      };
    }),
  );
  return res.status(200).json(cart);
});

router.post(
  "/add-to-cart",
  authenticate,
  authorize("user"),
  async (req, res) => {
    const { productId, quantity = 1, color, size } = req.body ?? {};

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return res
        .status(400)
        .json({ error: "Quantity must be an integer from 1 to 99" });
    }
    const product = await getProductById(productId);
    if (!product || !product.isListed) {
      return res.status(404).json({ error: "Product not found" });
    }
    const userId = new ObjectId(req.user.id);

    const existing = await Users.findOne(
      { _id: userId, "cart.productId": product._id },
      { projection: { "cart.$": 1 } },
    );
    const currentQty = existing?.cart?.[0]?.quantity ?? 0;
    if (currentQty + quantity > 99) {
      return res.status(400).json({ error: "Maximum quantity per item is 99" });
    }

    const bumped = await Users.updateOne(
      { _id: userId, "cart.productId": product._id },
      { $inc: { "cart.$.quantity": quantity } },
    );
    if (bumped.matchedCount === 0) {
      await Users.updateOne(
        { _id: userId },
        { $push: { cart: { productId: product._id, quantity, color, size } } },
      );
    }
    return res
      .status(200)
      .json(await Users.findOne({ _id: userId }, { projection: { cart: 1 } }));
  },
);

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
    const cart = await Users.findOne(
      { _id: userId },
      { projection: { cart: 1 } },
    );
    return res.status(200).json(cart.cart);
  },
);

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
    const cart = await Users.findOne(
      { _id: userId },
      { projection: { cart: 1 } },
    );

    return res.status(200).json(cart.cart);
  },
);

router.delete("/cart", authenticate, authorize("user"), async (req, res) => {
  const userId = new ObjectId(req.user.id);
  await Users.updateOne({ _id: userId }, { $set: { cart: [] } });
  return res.status(200).json({ cart: [], total: 0 });
});

export default router;
