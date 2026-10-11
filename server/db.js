import { MongoClient, ObjectId } from "mongodb";
import env from "./config/env.js";
import isObjectId from "./utils/objectId.js";

// TODO(security): fail fast if MONGO_URI is missing (see the dotenv import-order note in index.js)
const client = new MongoClient(env.MONGO_URI);
// TODO: db name is "store" here but "shop" elsewhere (deferred mismatch), pick one and use an env var
const db = client.db(env.DB_NAME);

export const Users = db.collection("users");
export const Products = db.collection("products");
export const Orders = db.collection("orders");
export const Reviews = db.collection("reviews");
const Counters = db.collection("counters");

export async function connectDB() {
  await client.connect();
  try {
    // makes duplicate emails fail with error code 11000
    await Users.createIndex({ email: 1 }, { unique: true });

    await Products.createIndexes([
      // keyword search (MongoDB allows only one text index per collection)
      { key: { name: "text", description: "text" } },
      { key: { category: 1 } },
      // public queries always filter on isListed, the home page also on isFeatured
      { key: { isListed: 1, isFeatured: 1 } },
    ]);

    await Orders.createIndexes([
      // "my orders"
      { key: { userId: 1 } },
      // never two orders with the same number (fix addOrder's orderNo first,
      // and delete test orders that already have a bad orderNo)
      { key: { orderNo: 1 }, unique: true },
      // admin list: filter by status, newest first
      { key: { status: 1, createdAt: -1 } },
    ]);
  } catch (error) {
    console.error("❌ Failed to create database indexes:", error.message);
    throw error;
  }
  console.log("✅ Database connected successfully");
}

// TODO: validate/trim/length-cap data at the route level (Zod), db helpers assume clean input
async function nextOrderNo() {
  const counter = await Counters.findOneAndUpdate(
    { _id: "orderNo" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" },
  );
  return counter.seq; // driver v5: counter.value.seq
}
export async function getUsers() {
  // TODO: pagination (skip/limit) for admin user list
  return await Users.find({}, { projection: { passwordHash: 0 } }).toArray();
}

export async function getUserByEmail(email) {
  return await Users.findOne({ email });
}

export async function getProducts() {
  // TODO: admin list: pagination + filters (category, isListed)
  // TODO: new getPublicProducts({ category, search, page, limit, sort }) that only returns isListed: true
  // TODO: new getFeaturedProducts() (isFeatured && isListed) for the home page
  return await Products.find().toArray();
}

export async function getOrders() {
  // TODO: pagination + filter by status, sort by createdAt desc
  // TODO: new getOrdersByUserId(userId) for "my orders"
  // TODO: new getOrderById(id)
  return await Orders.find().toArray();
}

export async function getReviews() {
  // TODO: limit/sort (latest or best rated) for the home page section
  return await Reviews.find().toArray();
}

// TODO: missing helpers
//   addProduct(data), updateProduct(id, data)
//   updateOrderStatus(id, status)  (Cancelled orders are never deleted and should not be editable afterwards)
//   addReview({ userId, username, productId, text, rating }) -> must write to BOTH Reviews and product.reviews
//   updateUser(id, fields), changePassword(id, hash), deleteUser(id) (decide: hard delete vs anonymize,
//   orders keep userId/userName and can't be deleted, so they would point to a missing user)

export async function addUser({ name, email, passwordHash }) {
  const user = {
    name,
    email,
    passwordHash,
    profileImg: null,
    address: null,
    number: null,
    cart: [],
    wishlist: [],
    role: "user", // always set on the server, never from req.body
  };
  const { insertedId } = await Users.insertOne(user);
  return {
    _id: insertedId,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function getProductById(id) {
  // TODO: ObjectId.isValid() also accepts any 12-character string, use a strict 24-hex check (utils/objectId.js)
  if (typeof id !== "string" || !ObjectId.isValid(id)) return null;
  return await Products.findOne({ _id: new ObjectId(id) });
}
export async function getUserById(id) {
  if (typeof id !== "string" || !ObjectId.isValid(id)) return null;
  // TODO: exclude passwordHash with a projection (this returns the full user document)
  return await Users.findOne({ _id: new ObjectId(id) });
}
export async function addOrder({
  userId,
  userName,
  userNumber,
  shippingAddress,
  items,
  totalPrice,
}) {
  const order = {
    userId: userId ?? null,
    userName,
    userNumber,
    shippingAddress,
    // TODO: snapshot each item { productId, name, price, quantity, img } so order history
    // survives price changes and unlisted products (right now only ids + quantities are stored)
    items,
    // TODO: prices are decimals (14.99): round to 2 decimals (or store cents) to avoid float artifacts
    totalPrice,
    // TODO: define the allowed statuses in one place (e.g. "In Process", "Shipped", "Delivered", "Cancelled")
    status: "In Process",
    createdAt: new Date(),
    orderNo: (await nextOrderNo()) ?? 1,
  };
  // TODO: placing the order and clearing the cart are two separate writes (see apiRoutes.js /add-order),
  // use a transaction (needs a replica set, Atlas has one) or make it idempotent.
  const { insertedId } = await Orders.insertOne(order);
  return {
    ...order,
    _id: insertedId,
  };
}

// TODO: add the optional stock/inventory decision (no stock field exists, nothing stops over-ordering)
// TODO: graceful close: export a closeDB() that calls client.close()
