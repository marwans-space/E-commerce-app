import express from "express";
import { ObjectId } from "mongodb";
import { Users, Products, addOrder, getOrderById } from "../db.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();
/* ======================================================================
   client/checkout + client/orders
   ====================================================================== */

// GET
router.get("/orders/me", authenticate, authorize("user"), async (req, res) => {
  const orders = await getOrderById(req.user.id);
  if (!orders) {
    res.status(404).json({ error: "User doesn't have orders" });
  }
  res.status(200).json(orders);
});

// POST
router.post("/add-order", authenticate, authorize("user"), async (req, res) => {
  const { userNumber, shippingAddress } = req.body ?? {};
  if (
    typeof userNumber !== "string" ||
    !userNumber ||
    !shippingAddress ||
    typeof shippingAddress !== "string"
  ) {
    return res.status(400).json({ error: "Missing or invalid credentials" });
  }
  const userId = new ObjectId(req.user.id);
  const user = await Users.findOne(
    { _id: userId },
    { projection: { name: 1, cart: 1 } },
  );
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }
  if (!user.cart?.length) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  const products = await Products.find({
    _id: { $in: user.cart.map((item) => item.productId) },
    isListed: true,
  }).toArray();

  // a cart item whose product is unlisted/deleted would make the total NaN
  if (products.length !== user.cart.length) {
    return res
      .status(409)
      .json({ error: "Some items in your cart are no longer available" });
  }

  const priceById = new Map(products.map((p) => [p._id.toString(), p.price]));

  const totalPrice =
    user.cart.reduce(
      (sum, item) =>
        sum + priceById.get(item.productId.toString()) * item.quantity,
      0,
    ) + 20;
  totalPrice = Math.round(totalPrice * 100) / 100;
  const order = {
    userId,
    userName: user.name,
    userNumber,
    shippingAddress,
    items: user.cart,
    totalPrice,
  };
  const placedOrder = await addOrder(order);
  await Users.updateOne(
    { _id: userId },
    { $set: { address: shippingAddress, number: userNumber, cart: [] } },
  );
  const updatedUser = await Users.findOne(
    { _id: userId },
    { projection: { name: 1, number: 1, address: 1, cart: 1 } },
  );
  return res.status(200).json({ order: placedOrder, user: updatedUser });
});

export default router;
