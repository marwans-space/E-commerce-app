import express from "express";
import isObjectId from "../utils/objectId.js";
import { ObjectId } from "mongodb";
import {
  Users,
  Products,
  Orders,
  Reviews,
  getProductById,
  getUserById,
  addOrder,
  getProducts,
  getOrders,
  getOrderById,
} from "../db.js";
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
// TODO: GET /orders/me/:id  (one order, 404 if it belongs to someone else)

// POST
// TODO: guest checkout (no login, order with userId: null, name + number + address + items from the request,
// prices still taken from the DB). Needs a separate route or optional authentication.
// TODO: validate userNumber (phone format, length) and shippingAddress (trim, max length) with Zod.
// TODO: the order and the cart clearing are two separate writes. If the second fails, a retry creates a
// duplicate order. Use a transaction or an idempotency key.
// TODO: no stock check, decide whether inventory is in scope.
// TODO: return an object { order, user } instead of an array [order, user].
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

  // TODO: round the total to 2 decimals (14.99 * 3 gives float artifacts)
  const totalPrice =
    user.cart.reduce(
      (sum, item) =>
        sum + priceById.get(item.productId.toString()) * item.quantity,
      0,
    ) + 20;
  const order = {
    userId,
    userName: user.name,
    userNumber,
    shippingAddress,
    // TODO: snapshot name, price, quantity, img per item instead of the raw cart
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
  return res.status(200).json([placedOrder, updatedUser]);
});

// PATCH
// TODO: PATCH /orders/me/:id/cancel  (user can cancel only while status is still "In Process")

// DELETE
// (none) orders are never deleted, cancelled orders stay as records
export default router;
